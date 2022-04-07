import type { SetRequired } from 'type-fest';
import type { NextApiHandler, NextConfig } from 'next';
import type {
  MutationVoucherify_CreateOrderArgs,
  MutationQueueReviewInvitationArgs,
  Reviews_PostResponse,
  Voucherify_Order,
  Voucherify_OrderItemInput,
  MutationCreateShipmentArgs,
  ShipEngine_Label,
  ShipEngine_Package
} from 'lib/takeshape/types';
import Stripe from 'stripe';
import { buffer } from 'micro';
import {
  stripeSecretKey,
  stripeWebhookSecret,
  takeshapeApiUrl,
  takeshapeWebhookApiKey,
  siteUrl,
  shipFrom
} from 'lib/config';
import { createApolloClient } from 'lib/apollo/client';
import { QueueReviewInvitation, CreateLoyaltyCardOrder, CreateShipment } from 'lib/queries';

const stripe = new Stripe(stripeSecretKey, { apiVersion: '2020-08-27' });
const client = createApolloClient(takeshapeApiUrl, () => takeshapeWebhookApiKey);

function isValidShippingAddress(
  address: Stripe.Address
): address is SetRequired<Stripe.Address, 'city' | 'country' | 'line1' | 'postal_code' | 'state'> {
  return Boolean(address.line1 && address.city && address.state && address.postal_code && address.country);
}

export const config: NextConfig = {
  api: {
    bodyParser: false
  }
};

async function handleReviews(customer: Stripe.Customer, session: Stripe.Checkout.Session) {
  try {
    const products = session.line_items.data.map((lineItem) => {
      const product = lineItem.price.product as Stripe.Product;
      return {
        sku: product.id,
        name: product.name,
        description: product.description ?? '',
        pageUrl: `https://${siteUrl}/${product.id}`,
        image: product.images[0] ?? ''
      };
    });

    const response = await client.mutate<
      { queueReviewInvitation: Reviews_PostResponse },
      MutationQueueReviewInvitationArgs
    >({
      mutation: QueueReviewInvitation,
      variables: {
        name: customer.name ?? 'Checkout Customer',
        email: customer.email,
        orderId: session.payment_intent as string,
        products
      }
    });

    return response;
  } catch (err) {
    return { errors: [err.message] };
  }
}

async function handleLoyaltyCard(customer: Stripe.Customer, session: Stripe.Checkout.Session) {
  try {
    const items = session.line_items.data.map((lineItem): Voucherify_OrderItemInput => {
      const product = lineItem.price.product as Stripe.Product;
      return {
        id: product.id,
        name: product.name,
        quantity: lineItem.quantity,
        price: lineItem.amount_subtotal
      };
    });

    const response = await client.mutate<{ order: Voucherify_Order }, MutationVoucherify_CreateOrderArgs>({
      mutation: CreateLoyaltyCardOrder,
      variables: {
        email: customer.email,
        amount: session.amount_subtotal,
        status: 'PAID',
        items
      }
    });

    return response;
  } catch (err) {
    return { errors: [err.message] };
  }
}

async function handleShipping(customer: Stripe.Customer, session: Stripe.Checkout.Session) {
  try {
    const shippingAddress = session.shipping.address ?? customer.address;

    if (!isValidShippingAddress(shippingAddress)) {
      return { errors: ['No valid shipping address'] };
    }

    const packages = session.line_items.data
      .map((lineItem): ShipEngine_Package => {
        const product = lineItem.price.product as Stripe.Product;
        if (product.shippable) {
          return {
            weight: {
              value: product.package_dimensions.weight,
              unit: 'ounce'
            }
          };
        }
      })
      .filter((x) => x);

    if (!packages.length) {
      return { errors: ['No shippable packages'] };
    }

    const response = await client.mutate<ShipEngine_Label, MutationCreateShipmentArgs>({
      mutation: CreateShipment,
      variables: {
        carrier_id: 'se-2074501',
        service_code: 'ups_ground',
        external_shipment_id: session.payment_intent as string,
        ship_to: {
          name: session.shipping.name ?? customer.name,
          phone: shipFrom.phone,
          address_line1: shippingAddress.line1,
          address_line2: shippingAddress.line2,
          postal_code: shippingAddress.postal_code,
          country_code: shippingAddress.country,
          city_locality: shippingAddress.city,
          state_province: shippingAddress.state
        },
        ship_from: {
          name: shipFrom.name,
          phone: shipFrom.phone,
          address_line1: shipFrom.addressLine1,
          postal_code: shipFrom.postalCode,
          country_code: shipFrom.countryCode,
          city_locality: shipFrom.cityLocality,
          state_province: shipFrom.stateProvince
        },
        packages
      }
    });

    return response;
  } catch (err) {
    return { errors: [err.message] };
  }
}

const handler: NextApiHandler = async (req, res) => {
  const { headers } = req;

  const stripeSignature = headers['stripe-signature'];
  const buf = await buffer(req);
  const event = stripe.webhooks.constructEvent(buf.toString(), stripeSignature, stripeWebhookSecret);

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object as Stripe.Checkout.Session;

        const { payment_status } = session;

        if (payment_status !== 'paid') {
          console.warn('Session not paid');
          break;
        }

        const maybeCustomer = await stripe.customers.retrieve(session.customer as string);

        if (maybeCustomer.deleted || !(maybeCustomer as Stripe.Customer).email) {
          console.warn('No valid customer');
          break;
        }

        const customer = maybeCustomer as Stripe.Customer;

        const fullSession = await stripe.checkout.sessions.retrieve(session.id, {
          expand: ['line_items', 'line_items.data.price.product']
        });

        const tasks = [];

        tasks.push(async () => {
          return await handleReviews(customer, fullSession);
        });
        tasks.push(async () => {
          return await handleLoyaltyCard(customer, fullSession);
        });
        tasks.push(async () => {
          return await handleShipping(customer, fullSession);
        });

        const results = await Promise.all(tasks);

        console.info(`Handled event type ${event.type}`, { results });

        res.status(200).json({
          data: {
            reviews: results[0],
            loyaltyCard: results[1],
            shipping: results[2]
          }
        });
        break;
      default:
        console.info(`Unhandled event type ${event.type}`);
        res.status(200).json({ data: null });
    }
    return;
  } catch (err) {
    console.error(err);
    res.status(500).json({ errors: [err.message] });
  }
};

export default handler;

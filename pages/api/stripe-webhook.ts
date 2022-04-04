import type { NextApiHandler, NextConfig } from 'next';
import type {
  MutationVoucherify_CreateOrderArgs,
  MutationQueueReviewInvitationArgs,
  Reviews_PostResponse,
  Voucherify_Order,
  Voucherify_OrderItemInput
} from 'lib/takeshape/types';
import Stripe from 'stripe';
import { buffer } from 'micro';
import { stripeSecretKey, stripeWebhookSecret, takeshapeApiUrl, takeshapeWebhookApiKey, siteUrl } from 'lib/config';
import { createApolloClient } from 'lib/apollo/client';
import { QueueReviewInvitation, CreateLoyaltyCardOrder } from 'lib/queries';

const stripe = new Stripe(stripeSecretKey, { apiVersion: '2020-08-27' });
const client = createApolloClient(takeshapeApiUrl, () => takeshapeWebhookApiKey);

export const config: NextConfig = {
  api: {
    bodyParser: false
  }
};

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

        const { email, name } = session.customer_details as any;

        if (!email) {
          console.warn('No email on session');
          break;
        }

        const fullSession = await stripe.checkout.sessions.retrieve(session.id, {
          expand: ['line_items', 'line_items.data.price.product']
        });

        const products = fullSession.line_items.data.map((lineItem) => {
          const product = lineItem.price.product as Stripe.Product;
          return {
            sku: product.id,
            name: product.name,
            description: product.description ?? '',
            pageUrl: `https://${siteUrl}/${product.id}`,
            image: product.images[0] ?? ''
          };
        });

        const queueReviewResponse = await client.mutate<
          { queueReviewInvitation: Reviews_PostResponse },
          MutationQueueReviewInvitationArgs
        >({
          mutation: QueueReviewInvitation,
          variables: {
            name: name ?? 'Checkout Customer',
            email,
            orderId: session.id,
            products
          }
        });

        const items = fullSession.line_items.data.map((lineItem): Voucherify_OrderItemInput => {
          const product = lineItem.price.product as Stripe.Product;
          return {
            id: product.id,
            name: product.name,
            quantity: lineItem.quantity,
            price: lineItem.amount_total
          };
        });

        const createLoyaltyCardOrderResponse = await client.mutate<
          { order: Voucherify_Order },
          MutationVoucherify_CreateOrderArgs
        >({
          mutation: CreateLoyaltyCardOrder,
          variables: {
            email,
            amount: session.amount_total,
            status: 'PAID',
            items
          }
        });

        if (queueReviewResponse.errors) {
          throw new Error(queueReviewResponse.errors.map((e) => e.message).join());
        }

        if (createLoyaltyCardOrderResponse.errors) {
          throw new Error(createLoyaltyCardOrderResponse.errors.map((e) => e.message).join());
        }

        console.info(`Handled event type ${event.type}`);
        break;
      default:
        console.info(`Unhandled event type ${event.type}`);
    }
    res.status(200).json({ status: 'ok' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 'error', message: err.message });
  }
};

export default handler;

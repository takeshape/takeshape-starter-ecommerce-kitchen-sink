import type { NextApiHandler } from 'next';
import Stripe from 'stripe';
import { stripePublishableKey, stripeWebhookSecret, takeshapeApiUrl, takeshapeWebhookApiKey } from 'lib/config';
import { createApolloClient } from 'lib/apollo/client';
import { QueueReviewInvitation } from 'lib/queries';

const stripe = new Stripe(stripePublishableKey, { apiVersion: '2020-08-27' });
const client = createApolloClient(takeshapeApiUrl, () => takeshapeWebhookApiKey);

const handler: NextApiHandler = async (req, res) => {
  const { body, headers } = req;
  const stripeSignature = headers['stripe-signature'];
  const event = stripe.webhooks.constructEvent(body, stripeSignature, stripeWebhookSecret);

  try {
    switch (event.type) {
      case 'invoice.paid':
        const invoice = event.data.object as Stripe.Invoice;
        console.log(invoice);

        const lineItemsPromise = invoice.lines.data.map(async (lineItem) =>
          stripe.invoiceItems.retrieve(lineItem.id, { expand: ['data.price.product'] })
        );
        const lineItems = await Promise.all(lineItemsPromise);

        console.log('lineItems', lineItems);

        const products = lineItems.map((lineItem) => {
          const product = lineItem.price.product as Stripe.Product;
          return {
            sku: product.id,
            name: product.name,
            description: product.description,
            pageUrl: `product/${product.id}`,
            image: product.images[0]
          };
        });

        console.log('products', products);

        const { data } = await client.mutate({
          mutation: QueueReviewInvitation,
          variables: {
            name: invoice.customer_name,
            email: invoice.customer_email,
            orderId: invoice.id,
            products
          }
        });

        if (data.errors) {
          throw new Error(data.errors.map((e) => e.message).join());
        }

        console.info(data);
        res.status(200);
        break;
      default:
        console.log(`Unhandled event type ${event.type}`);
        res.status(200);
    }
  } catch (err) {
    console.error(err);
    res.status(500);
  }
};

export default handler;

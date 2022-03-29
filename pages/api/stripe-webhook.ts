import type { NextApiHandler, NextConfig } from 'next';
import Stripe from 'stripe';
import { buffer } from 'micro';
import { stripeSecretKey, stripeWebhookSecret, takeshapeApiUrl, takeshapeWebhookApiKey, siteUrl } from 'lib/config';
import { createApolloClient } from 'lib/apollo/client';
import { QueueReviewInvitation } from 'lib/queries';

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
      case 'invoice.paid':
        const invoice = event.data.object as Stripe.Invoice;

        if (!invoice.customer_email) {
          console.warn('No email on invoice');
          break;
        }

        const lineItemsPromise = invoice.lines.data.map(async (lineItem) =>
          stripe.invoiceItems.retrieve(lineItem.id, { expand: ['price.product'] })
        );
        const lineItems = await Promise.all(lineItemsPromise);

        const products = lineItems.map((lineItem) => {
          const product = lineItem.price.product as Stripe.Product;
          return {
            sku: product.id,
            name: product.name,
            description: product.description ?? '',
            pageUrl: `https://${siteUrl}/${product.id}`,
            image: product.images[0] ?? ''
          };
        });

        const { data } = await client.mutate({
          mutation: QueueReviewInvitation,
          variables: {
            name: invoice.customer_name ?? 'Customer',
            email: invoice.customer_email,
            orderId: invoice.id,
            products
          }
        });

        if (data.errors) {
          throw new Error(data.errors.map((e) => e.message).join());
        }

        console.info(data);
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

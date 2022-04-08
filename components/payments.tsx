import type {
  Stripe_PaymentIntent,
  Stripe_Invoice,
  Stripe_Item,
  Stripe_LineItem,
  Stripe_CheckoutSession
} from 'lib/takeshape/types';
import NextLink from 'next/link';
import { Badge, Flex, Box, Card, IconButton, Paragraph, Link, Heading, Text, Grid } from '@theme-ui/components';
import { formatPrice } from 'lib/utils/text';
import { format } from 'date-fns';
import startCase from 'lodash/startCase';
import { BsCheckCircleFill, BsReceipt } from 'react-icons/bs';
import { ProductImage } from './product';

export interface OrderStatusProps {
  status: 'unknown' | 'in_transit' | 'delivered' | 'error';
  trackingNumber?: string | null;
}

export const OrderStatus = ({ status, trackingNumber }: OrderStatusProps) => {
  const statusMap = {
    unknown: {
      text: 'Processing',
      color: 'gray'
    },
    in_transit: {
      text: 'Shipped',
      color: 'green'
    },
    delivered: {
      text: 'Delivered',
      color: 'purple'
    },
    error: {
      text: 'Error',
      color: 'red'
    }
  };

  const statusObj = statusMap[status];

  return (
    <Flex sx={{ gap: '.5rem' }}>
      <Badge py={1} px={2} backgroundColor={statusObj.color}>
        {startCase(statusObj.text)}
      </Badge>
      {trackingNumber && (
        <Badge py={1} px={2} backgroundColor={statusObj.color}>
          {trackingNumber}
        </Badge>
      )}
    </Flex>
  );
};

export interface ProductLineItemProps {
  id: string;
  name: string;
  description: string;
  images?: string[];
  amount: number;
  currency: string;
  quantity: number;
}

const ProductLineItem = ({ id, name, description, images, quantity, amount, currency }: ProductLineItemProps) => {
  return (
    <Card sx={{ height: '100%', cursor: 'pointer', p: 0 }}>
      <NextLink href={`/product/${id}`} passHref>
        <Grid gap={2} columns={['1fr 2fr 1fr']}>
          <Box sx={{ textAlign: 'left' }}>
            <Link sx={{ display: 'inline-block' }}>
              <ProductImage maxHeight="60px" images={images} />
            </Link>
          </Box>
          <Flex sx={{ flexDirection: 'column', justifyContent: 'center', alignItems: 'left' }}>
            <Heading sx={{ margin: '0', fontSize: '1em', lineHeight: '1' }}>
              <Link sx={{ color: '#333', ':hover': { color: 'primary' }, textDecoration: 'none' }}>
                {quantity} x {name}
              </Link>
            </Heading>
            <Paragraph sx={{ fontSize: '0.7rem', textAlign: 'initial' }}>
              <Text>{description}</Text>
            </Paragraph>
          </Flex>
          <Box sx={{ textAlign: 'right' }}>{formatPrice(currency, amount)}</Box>
        </Grid>
      </NextLink>
    </Card>
  );
};

export interface ProductListProps {
  lineItems: ProductLineItemProps[];
}

const ProductList = ({ lineItems }: ProductListProps) => {
  return (
    <Card sx={{ p: 0 }}>
      {lineItems.map((line) => {
        return (
          <Box key={line.id} sx={{ px: 0, py: 2 }}>
            <ProductLineItem {...line} />
          </Box>
        );
      })}
    </Card>
  );
};

function isStripeInvoice(maybe: unknown): maybe is Stripe_Invoice {
  return (maybe as Stripe_Invoice).object === 'invoice';
}

function isStripeCheckoutSession(maybe: unknown): maybe is Stripe_CheckoutSession {
  return (maybe as Stripe_CheckoutSession).object === 'checkoutDOTsession';
}

function getLineItems(invoiceOrSession: Stripe_Invoice | Stripe_CheckoutSession): ProductLineItemProps[] | undefined {
  if (isStripeInvoice(invoiceOrSession)) {
    return invoiceOrSession.lines?.data?.map((line) => ({
      id: line.id,
      name: line.price.product.name,
      description: line.price.product.description,
      images: line.price.product.images,
      amount: line.amount,
      currency: line.currency,
      quantity: line.quantity
    }));
  }

  return invoiceOrSession.line_items?.data?.map((line) => ({
    id: line.id,
    name: line.price.product.name,
    description: line.price.product.description,
    images: line.price.product.images,
    amount: line.amount_total,
    currency: line.currency,
    quantity: line.quantity
  }));
}

export const PaymentItemCard = ({
  payment: { created, invoice, currency, amount, session, shipment }
}: {
  payment: Stripe_PaymentIntent;
}) => {
  invoice = invoice as Stripe_Invoice;
  // Only subscriptions will have `session`, and one-off purchases will only have `session`.
  // We get the same data from both, so we collapse here, preferring the `invoice`.
  const lineItems = getLineItems(invoice ?? session);

  return (
    <Card sx={{ width: '100%' }}>
      <Flex sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
        <Paragraph variant="smallHeading" sx={{ lineHeight: '2' }}>
          {format(created * 1000, 'PP')}
        </Paragraph>
        <Box sx={{ textAlign: 'right' }}>
          {invoice?.invoice_pdf ? (
            <Link title="Download Receipt" target="_blank" rel="noreferrer" href={invoice?.invoice_pdf}>
              <IconButton color="text">
                <BsReceipt size={16} />
              </IconButton>
            </Link>
          ) : null}
          {invoice?.paid ? <BsCheckCircleFill title="Paid" color="green" size={16} /> : null}
        </Box>
      </Flex>
      <Box>{lineItems && <ProductList lineItems={lineItems} />}</Box>
      <Flex sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
        <OrderStatus
          status={(shipment?.tracking_status ?? 'unknown') as OrderStatusProps['status']}
          trackingNumber={shipment?.tracking_number}
        />
        <Paragraph>{formatPrice(currency, amount)}</Paragraph>
      </Flex>
    </Card>
  );
};

export const PaymentList = ({ payments }) => {
  if (!payments || !payments.length) {
    return <Paragraph>No payments to display!</Paragraph>;
  }
  return (
    <Flex as="ul" sx={{ flexDirection: 'column', listStyleType: 'none', padding: 0 }}>
      {payments.map((payment) => (
        <Box
          as="li"
          key={payment.id}
          sx={{ marginBottom: '1rem', borderBottom: '1px solid', borderBlockColor: '#ccc', borderRadius: 0 }}
        >
          <PaymentItemCard payment={payment} />
        </Box>
      ))}
    </Flex>
  );
};

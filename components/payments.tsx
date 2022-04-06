import type { Stripe_PaymentIntent, Stripe_Invoice, Stripe_Item } from 'lib/takeshape/types';
import NextLink from 'next/link';
import { Badge, Flex, Box, Card, IconButton, Paragraph, Link, Heading, Text } from '@theme-ui/components';
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
}

const ProductLineItem = ({ id, name, description, images, amount, currency }: ProductLineItemProps) => {
  return (
    <Card sx={{ height: '100%', cursor: 'pointer' }}>
      <NextLink href={`/product/${id}`} passHref>
        <Flex sx={{ height: '100%', flexDirection: 'row', gap: '1rem' }}>
          <Box sx={{ flexGrow: 1 }}>
            <Link>
              <ProductImage maxHeight="75px" images={images} />
            </Link>
          </Box>
          <Flex sx={{ flexDirection: 'column', flexGrow: 4 }}>
            <Heading sx={{ margin: '0', fontSize: '1em', lineHeight: '1' }}>
              <Link sx={{ color: 'inherit', ':hover': { color: 'primary' }, textDecoration: 'none' }}>{name}</Link>
            </Heading>
            <Paragraph sx={{ fontSize: '0.8rem' }}>
              <Text>{description}</Text>
            </Paragraph>
          </Flex>
          <Box sx={{ flexGrow: 1 }}>{formatPrice(currency, amount)}</Box>
        </Flex>
      </NextLink>
    </Card>
  );
};

export interface ProductListProps {
  lineItems: Stripe_Item[];
  currency: string;
}

const ProductList = ({ lineItems, currency }: ProductListProps) => {
  return (
    <Card>
      {lineItems.map((line) => {
        const { amount_total } = line;
        const { id, name, description, images } = line.price.product;
        return (
          <Box key={line.id}>
            <ProductLineItem
              id={id}
              name={name}
              description={description}
              images={images}
              amount={amount_total}
              currency={currency}
            />
          </Box>
        );
      })}
    </Card>
  );
};

export const PaymentItemCard = ({
  payment: { created, invoice, currency, amount, session, shipment }
}: {
  payment: Stripe_PaymentIntent;
}) => {
  invoice = invoice as Stripe_Invoice;
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
      <Box>{session && <ProductList lineItems={session.line_items.data} currency={currency} />}</Box>
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
      {payments.map((payment, index) => (
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

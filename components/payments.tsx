import { Badge, Flex, Box, Card, IconButton, Paragraph, Link } from '@theme-ui/components';
import { formatPrice } from 'lib/utils/text';
import { format } from 'date-fns';
import startCase from 'lodash/startCase';
import { BsCheckCircleFill, BsReceipt } from 'react-icons/bs';

export interface OrderStatusProps {
  status: 'processing' | 'shipped' | 'delivered';
  trackingNumber?: string | null;
}

export const OrderStatus: React.FC<OrderStatusProps> = ({ status, trackingNumber }) => {
  const colorMap = {
    processing: 'primary',
    shipped: 'gray',
    delivered: 'purple'
  };
  return (
    <Flex sx={{ gap: '.5rem' }}>
      <Badge py={1} px={2} backgroundColor={colorMap[status] ?? 'gray'}>
        {startCase(status)}
      </Badge>
      {trackingNumber && (
        <Badge py={1} px={2} backgroundColor="gray">
          {trackingNumber}
        </Badge>
      )}
    </Flex>
  );
};

const ordersFixture: OrderStatusProps[] = [
  {
    status: 'processing',
    trackingNumber: null
  },
  {
    status: 'shipped',
    trackingNumber: 'Z0123456789R1337'
  },
  {
    status: 'delivered'
  }
];

export const PaymentItemCard = ({ payment: { created, invoice, currency, amount }, order }) => {
  return (
    <Card sx={{ width: '100%' }}>
      <Flex sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
        <Paragraph variant="smallHeading" sx={{ lineHeight: '2' }}>
          {format(created * 1000, 'PP')}
        </Paragraph>
        <Box sx={{ textAlign: 'right' }}>
          {invoice?.invoicePdf ? (
            <Link title="Download Receipt" target="_blank" rel="noreferrer" href={invoice.invoicePdf}>
              <IconButton color="text">
                <BsReceipt size={16} />
              </IconButton>
            </Link>
          ) : null}
          {invoice?.paid ? <BsCheckCircleFill title="Paid" color="green" size={16} /> : null}
        </Box>
      </Flex>
      <Flex sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
        <Paragraph>{formatPrice(currency, amount)}</Paragraph>
        {order && <OrderStatus status={order.status} trackingNumber={order.trackingNumber} />}
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
        <Box as="li" key={payment.id} sx={{ marginBottom: '1rem' }}>
          <PaymentItemCard payment={payment} order={ordersFixture[index] ?? ordersFixture[2]} />
        </Box>
      ))}
    </Flex>
  );
};

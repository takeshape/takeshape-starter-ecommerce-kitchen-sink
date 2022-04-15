import { useMutation } from '@apollo/client';
import { Alert, Box, Card, Flex, Heading, Paragraph, Text } from '@theme-ui/components';
import { locale } from 'lib/config';
import { DeleteMySubscription, GetMyPurchasesData } from 'lib/queries';
import { formatPrice } from 'lib/utils/text';
import { SubmitButton } from './buttons';
import { ProductImage } from './product';

export const SubscriptionItemCard = ({ subscription, subscriptionItem }) => {
  const [setCancelPayload, { error: cancelError, loading: cancelLoading }] = useMutation(DeleteMySubscription, {
    refetchQueries: [GetMyPurchasesData],
    awaitRefetchQueries: true
  });

  const { current_period_end: currentPeriodEnd } = subscription;
  const nextBillDate = new Date(currentPeriodEnd * 1000);

  const {
    price: { product, ...price }
  } = subscriptionItem;

  const handleCancelSubscription = () => {
    setCancelPayload({
      variables: { subscriptionId: subscription.id }
    });
  };

  return (
    <Card sx={{ display: 'flex', gap: '1rem', width: '100%' }}>
      <Box sx={{ flex: '0 1 4rem' }}>
        <ProductImage images={product.images} maxHeight="4rem" />
      </Box>
      <Flex
        sx={{ flex: '1 1 auto', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'flex-start' }}
      >
        <Box>
          <Heading>{product.name}</Heading>
          <Paragraph>
            <Text>
              {formatPrice(price.currency, price.unitAmount)} / {price.recurring?.interval || ''}
            </Text>
          </Paragraph>
        </Box>
        <Box>
          <Paragraph>
            <strong>Next Bill:</strong>{' '}
            <Text>{nextBillDate.toLocaleString(locale, { month: 'long', year: 'numeric', day: 'numeric' })}</Text>
          </Paragraph>
        </Box>
      </Flex>
      <Box sx={{ flex: '0 1 auto' }}>
        {cancelError && (
          <>
            <Alert>Error canceling Stripe subscription</Alert>
            <pre style={{ color: 'red' }}>{JSON.stringify(cancelError, null, 2)}</pre>
          </>
        )}

        <SubmitButton text="Cancel" onClick={handleCancelSubscription} isSubmitting={cancelLoading} />
      </Box>
    </Card>
  );
};

export const SubscriptionList = ({ subscriptions }) => {
  if (!subscriptions || !subscriptions.length) return <Paragraph>No subscriptions to display!</Paragraph>;
  const listItems = subscriptions.map(
    (subscription) =>
      subscription.items?.data?.[0] && (
        <Box as="li" key={subscription.id} sx={{ marginBottom: '1rem' }}>
          <SubscriptionItemCard subscription={subscription} subscriptionItem={subscription.items.data[0]} />
        </Box>
      )
  );
  return (
    <Box as="ul" sx={{ listStyleType: 'none', padding: 0 }}>
      {listItems}
    </Box>
  );
};

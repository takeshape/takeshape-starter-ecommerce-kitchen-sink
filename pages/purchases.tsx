import type { NextPage } from 'next';
import type { Voucherify_LoyaltyCard } from 'lib/takeshape/types';
import { withAuthenticationRequired } from '@auth0/auth0-react';
import { Heading, Divider, Alert, Spinner, Container, Flex, Box } from '@theme-ui/components';
import { Page, Section } from 'components/layout';
import { SubscriptionList } from 'components/subscriptions';
import { PaymentList } from 'components/payments';
import { useQuery } from '@apollo/client';
import { GetMySubscriptions, GetMyPayments, GetMyLoyaltyCard } from 'lib/queries';
import { useProfile } from 'lib/takeshape';
import LoyaltyCard from 'components/loyalty-card';

const PurchasesPage: NextPage = () => {
  const { isProfileReady } = useProfile();
  const skip = !isProfileReady;
  const { data: subscriptionsData, error: subscriptionsError } = useQuery(GetMySubscriptions, { skip });
  const { data: paymentsData, error: paymentsError } = useQuery(GetMyPayments, { skip });
  const { data: loyaltyData, error: loyaltyCardError } = useQuery<{ getMyLoyaltyCard: Voucherify_LoyaltyCard }>(
    GetMyLoyaltyCard,
    {
      skip
    }
  );

  return (
    <Page>
      <Heading as="h1" variant="styles.pageTitle">
        Purchases
      </Heading>
      <Flex sx={{ gap: '2rem' }}>
        <Box sx={{ flex: '0 1 24rem' }}>
          <Section>
            {loyaltyData ? <LoyaltyCard {...loyaltyData.getMyLoyaltyCard} /> : <Spinner />}
            {loyaltyCardError && (
              <>
                <Alert>Error loading loyalty card</Alert>
                <pre style={{ color: 'red' }}>{JSON.stringify(loyaltyCardError, null, 2)}</pre>
              </>
            )}
          </Section>
          <Section>
            <Heading variant="smallHeading" id="payments">
              Past Payments
            </Heading>
            <Divider />

            {!paymentsData && <Spinner />}

            {paymentsData && <PaymentList payments={paymentsData.payments} />}

            {paymentsError && (
              <>
                <Alert>Error loading payments</Alert>
                <pre style={{ color: 'red' }}>{JSON.stringify(paymentsError, null, 2)}</pre>
              </>
            )}
          </Section>
        </Box>
        <Box sx={{ flex: '1 1 32rem' }}>
          <Section>
            <Heading variant="smallHeading" id="subscriptions">
              Active Subscriptions
            </Heading>
            <Divider />

            {!subscriptionsData && <Spinner />}

            {subscriptionsData && <SubscriptionList subscriptions={subscriptionsData.subscriptions} />}

            {subscriptionsError && (
              <>
                <Alert>Error loading subscriptions</Alert>
                <pre style={{ color: 'red' }}>{JSON.stringify(subscriptionsError, null, 2)}</pre>
              </>
            )}
          </Section>
        </Box>
      </Flex>
    </Page>
  );
};

export default withAuthenticationRequired(PurchasesPage, {
  onRedirecting: () => (
    <Container variant="layout.loading">
      <Spinner />
    </Container>
  )
});

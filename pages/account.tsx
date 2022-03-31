import { useState } from 'react';
import type { NextPage } from 'next';
import { Heading, Divider, Alert, Container, Spinner, Box, Flex, Grid } from '@theme-ui/components';
import { withAuthenticationRequired } from '@auth0/auth0-react';
import { Page, Section } from 'components/layout';
import { ProfileForm, CustomerForm } from 'components/forms';
import { useQuery } from '@apollo/client';
import { GetMyProfile, GetNewsletters, GetMyLoyaltyCard } from 'lib/queries';
import { useProfile } from 'lib/takeshape';
import { NewsletterToggle } from 'components/account/newsletter-toggle';
import { Logout } from 'components/user';
import { Referral, CreateReferral, ReferralList } from 'components/account/referrals';

const referralsFixtureData: Referral[] = [
  {
    email: 'mark@takeshape.io',
    sent: new Date(2022, 1, 23),
    earned: true
  }
];

const AccountPage: NextPage = () => {
  const { isProfileReady } = useProfile();
  const { data: profileData, error: profileError } = useQuery(GetMyProfile, {
    skip: !isProfileReady
  });
  const { data: newsletterData, error: newsletterError } = useQuery(GetNewsletters, { skip: !isProfileReady });
  const [referrals, setReferrals] = useState<Referral[]>(referralsFixtureData);
  return (
    <Page>
      <Flex sx={{ width: '100%', gap: '2rem', alignItems: 'baseline' }}>
        <Heading as="h1" variant="styles.pageTitle">
          Account
        </Heading>
        <Logout />
      </Flex>

      <Section sx={{ marginTop: '4rem' }}>
        <Heading variant="smallHeading">TakeShape Profile</Heading>
        <Divider sx={{ marginBottom: '1rem' }} />
        {profileData ? <ProfileForm profile={profileData.profile} /> : <Spinner />}
      </Section>

      <Grid columns={2}>
        <Section sx={{ marginTop: '4rem' }}>
          <Heading variant="smallHeading">Klavyio Subscriptions</Heading>
          <Divider sx={{ marginBottom: '1rem' }} />

          {!newsletterData && <Spinner />}

          {profileData && newsletterData && (
            <Box as="ul" sx={{ listStyleType: 'none', padding: 0 }}>
              {newsletterData.newsletters.items.map((newsletter) => (
                <Box as="li" key={newsletter.listId} sx={{ marginBottom: '1rem' }}>
                  <NewsletterToggle email={profileData.profile?.email} newsletter={newsletter} />
                </Box>
              ))}
            </Box>
          )}

          {newsletterError && (
            <>
              <Alert>Error loading newsletter subscriptions</Alert>
              <pre style={{ color: 'red' }}>{JSON.stringify(newsletterError, null, 2)}</pre>
            </>
          )}
        </Section>

        <Section sx={{ marginTop: '4rem' }}>
          <Heading variant="smallHeading">Referrals</Heading>
          <Divider sx={{ marginBottom: '1rem' }} />
          <CreateReferral sendReferral={(data) => setReferrals([...referrals, data])} />
          <ReferralList referrals={referrals} />
        </Section>
      </Grid>

      <Section sx={{ marginTop: '4rem' }}>
        <Heading variant="smallHeading">Stripe Customer</Heading>
        <Divider sx={{ marginBottom: '1rem' }} />
        {profileData ? <CustomerForm customer={profileData.profile?.customer} /> : <Spinner />}
      </Section>

      {profileError && (
        <>
          <Alert>Error loading TakeShape profile</Alert>
          <pre style={{ color: 'red' }}>{JSON.stringify(profileError, null, 2)}</pre>
        </>
      )}
    </Page>
  );
};

export default withAuthenticationRequired(AccountPage, {
  onRedirecting: () => (
    <Container variant="layout.loading">
      <Spinner />
    </Container>
  )
});

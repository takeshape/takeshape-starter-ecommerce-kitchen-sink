import type { NextPage } from 'next';
import { Heading, Divider, Alert, Container, Spinner, Box } from '@theme-ui/components';
import { withAuthenticationRequired } from '@auth0/auth0-react';
import { Page, Section } from 'components/layout';
import { ProfileForm, CustomerForm } from 'components/forms';
import { useQuery } from '@apollo/client';
import { GetMyProfile, GetNewsletters, GetMyLoyaltyCard } from 'lib/queries';
import { useProfile } from 'lib/takeshape';
import { NewsletterToggle } from 'components/account/newsletter-toggle';

const AccountPage: NextPage = () => {
  const { isProfileReady } = useProfile();
  const { data: profileData, error: profileError } = useQuery(GetMyProfile, {
    skip: !isProfileReady
  });
  const { data: newsletterData, error: newsletterError } = useQuery(GetNewsletters, { skip: !isProfileReady });

  return (
    <Page>
      <Heading as="h1" sx={{ fontSize: '3rem', marginBottom: '2rem' }}>
        Account
      </Heading>

      <Section sx={{ marginTop: '4rem' }}>
        <Heading variant="smallHeading">TakeShape Profile</Heading>
        <Divider sx={{ marginBottom: '1rem' }} />
        {profileData ? <ProfileForm profile={profileData.profile} /> : <Spinner />}
      </Section>

      <Section sx={{ marginTop: '4rem' }}>
        <Heading variant="smallHeading">Newsletter Subscriptions</Heading>
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

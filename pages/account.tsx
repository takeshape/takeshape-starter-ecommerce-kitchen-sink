import type { NextPage } from 'next';
import { Heading, Divider, Alert, Container, Spinner, Box } from '@theme-ui/components';
import { withAuthenticationRequired } from '@auth0/auth0-react';
import { Page, Section } from 'components/layout';
import { ProfileForm, CustomerForm } from 'components/forms';
import { useQuery } from '@apollo/client';
import { GetMyProfile, GetNewsletters, GetMyLoyaltyCard } from 'lib/queries';
import { useProfile } from 'lib/takeshape';
import { NewsletterToggle } from 'components/newsletter-toggle';

const AccountPage: NextPage = () => {
  const { isProfileReady } = useProfile();
  const { data: profileData, error: profileError } = useQuery(GetMyProfile, {
    skip: !isProfileReady
  });
  const { data: newsletterData, error: newsletterError } = useQuery(GetNewsletters, { skip: !isProfileReady });

  return (
    <Page>
      <Heading as="h1">Account</Heading>
      <Divider />

      <Section>
        <Heading variant="smallHeading">TakeShape Profile</Heading>
        <Divider />

        {!profileData && <Spinner />}

        {profileData && <ProfileForm profile={profileData.profile} />}
      </Section>

      <Section>
        <Heading variant="smallHeading">Stripe Customer</Heading>
        <Divider />

        {!profileData && <Spinner />}

        {profileData && <CustomerForm customer={profileData.profile?.customer} />}
      </Section>

      <Section>
        <Heading variant="smallHeading">Newsletter Subscriptions</Heading>
        <Divider />

        {!newsletterData && <Spinner />}

        {profileData && newsletterData && (
          <Box as="ul" sx={{ listStyleType: 'none' }}>
            {newsletterData.newsletters.items.map((newsletter) => (
              <Box as="li" key={newsletter.listId}>
                <NewsletterToggle email={profileData.profile.email} newsletter={newsletter} />
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

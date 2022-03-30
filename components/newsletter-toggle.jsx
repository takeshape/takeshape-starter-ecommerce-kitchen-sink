import { useMutation } from '@apollo/client';
import { Box, Flex, Label, Spinner, Switch } from '@theme-ui/components';
import { GetNewsletterSubscriptionStatus, SubscribeToNewsletter, UnsubscribeFromNewsletter } from 'lib/queries';
import { useCallback, useEffect, useState } from 'react';

export const NewsletterToggle = ({ email, newsletter }) => {
  const [getStatus, { data, loading }] = useMutation(GetNewsletterSubscriptionStatus);
  const [subscribe, { called: subscribeCalled, loading: subscribeLoading }] = useMutation(SubscribeToNewsletter);
  const [unsubscribe, { called: unsubscribeCalled, loading: unsubscribeLoading }] =
    useMutation(UnsubscribeFromNewsletter);
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    getStatus({ variables: { listId: newsletter.listId, email } });
  }, [getStatus, email, newsletter.listId]);

  useEffect(() => {
    setSubscribed(data?.members.length > 0);
  }, [data]);

  const onChange = useCallback(() => {
    if (subscribed) {
      unsubscribe({ variables: { listId: newsletter.listId, email } });
      setSubscribed(false);
    } else {
      subscribe({ variables: { listId: newsletter.listId, email } });
      setSubscribed(true);
    }
  }, [email, newsletter.listId, subscribe, subscribed, unsubscribe]);

  return (
    <Flex sx={{ justifyContent: 'space-between', alignItems: 'center', py: 2 }}>
      <Label sx={{ flex: 1 }}>{newsletter.listName}</Label>
      {loading ? (
        <Spinner />
      ) : (
        <Box>
          <Switch
            checked={subscribed}
            onChange={onChange}
            disabled={(subscribeCalled && subscribeLoading) || (unsubscribeCalled && unsubscribeLoading)}
          />
        </Box>
      )}
    </Flex>
  );
};

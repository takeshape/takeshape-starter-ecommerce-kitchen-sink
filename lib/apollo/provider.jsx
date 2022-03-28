import { ApolloProvider } from '@apollo/client';
import { useAuth0 } from '@auth0/auth0-react';
import { takeshapeApiKey } from 'lib/config';

import { createApolloClient } from './client';

export const AuthorizedApolloProvider = ({ uri, children }) => {
  const { isAuthenticated, getAccessTokenSilently } = useAuth0();

  const getAccessToken = isAuthenticated ? getAccessTokenSilently : () => takeshapeApiKey;

  const client = createApolloClient(uri, getAccessToken);

  return <ApolloProvider client={client}>{children}</ApolloProvider>;
};

export default AuthorizedApolloProvider;

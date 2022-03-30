import { Container, Divider, Flex, NavLink, Box, Text } from '@theme-ui/components';
import Head from 'next/head';
import Link from 'next/link';
import { useAuth0 } from '@auth0/auth0-react';
import { CartIcon, CartSidebar } from './cart';
import Notifications from './notifications';
import { Logout, Login } from './user';
import { Search } from './search';

export const Header = () => {
  const { user } = useAuth0();

  return (
    <Container as="header">
      <Flex as="nav" sx={{ gap: '2rem', alignItems: 'center' }}>
        <Link href="/" passHref>
          <NavLink>Home</NavLink>
        </Link>
        <Link href="/about" passHref>
          <NavLink>About</NavLink>
        </Link>
        <Box variant="styles.flexspace" sx={{ flex: '1 1 auto' }}>
          <Search />
        </Box>
        <Box variant="links.nav">
          <CartIcon />
        </Box>
        {user ? (
          <>
            <Link href="/account" passHref>
              <NavLink>Account</NavLink>
            </Link>
            <Link href="/purchases" passHref>
              <NavLink>Purchases</NavLink>
            </Link>
            <Box variant="links.nav">
              <Logout />
            </Box>
          </>
        ) : (
          <Box variant="links.nav">
            <Login />
          </Box>
        )}
      </Flex>
    </Container>
  );
};

export const Footer = () => {
  return (
    <Container as="footer" variant="layout.footer">
      <Text variant="smallHeading">
        Made by <Link href="https://www.takeshape.io">TakeShape</Link>
      </Text>
    </Container>
  );
};

export const Section = ({ children, ...props }) => {
  return (
    <Box
      as="section"
      sx={{
        mb: 4
      }}
      {...props}
    >
      {children}
    </Box>
  );
};

export const Page = ({ children }) => {
  return (
    <Flex variant="layout.page">
      <Head>
        <title>TakeShape E-commerce Kitchen Sink Starter</title>
      </Head>

      <Header />
      <Divider />
      <Container as="main" variant="layout.main">
        {children}
      </Container>

      <CartSidebar />
      <Notifications />

      <Footer />

      <style jsx global>{`
        body {
          margin: 0;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif,
            'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol';
        }
      `}</style>
    </Flex>
  );
};

export default Page;

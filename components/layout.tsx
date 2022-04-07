import { Container, Divider, Flex, NavLink, Link as ThemeLink, IconButton, Box, Text } from '@theme-ui/components';
import Head from 'next/head';
import Link from 'next/link';
import { useAuth0 } from '@auth0/auth0-react';
import { CartIcon, CartSidebar } from './cart';
import Notifications from './notifications';
import { Login } from './user';
import { Search } from './search';
import { BsQuestionSquare, BsReceiptCutoff, BsPersonCircle as AccountIcon } from 'react-icons/bs';

export const Header = () => {
  const { user } = useAuth0();

  return (
    <Container as="header" sx={{ maxWidth: '72rem' }}>
      <Flex as="nav" sx={{ gap: '2rem', alignItems: 'center' }}>
        <Link href="/" passHref>
          <NavLink title="Home" variant="styles.shopName">
            Kitchen<span>Sink</span>
          </NavLink>
        </Link>
        <Link href="/about" passHref>
          <NavLink title="About">
            <IconButton>
              <BsQuestionSquare size={24} />
            </IconButton>
          </NavLink>
        </Link>
        <Box variant="styles.flexspace" sx={{ flex: '1 1 auto' }}>
          <Search />
        </Box>
        <Box variant="links.nav">
          <CartIcon />
        </Box>
        {user ? (
          <>
            <Link href="/purchases" passHref>
              <NavLink title="Purchases">
                <IconButton>
                  <BsReceiptCutoff size={24} />
                </IconButton>
              </NavLink>
            </Link>
            <Link href="/account" passHref>
              <NavLink title="Account" sx={{ display: 'block' }}>
                <IconButton>
                  <AccountIcon size={24} />
                </IconButton>
              </NavLink>
            </Link>
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
    <Container as="footer" variant="layout.footer" sx={{ width: '100%', textAlign: 'center', padding: '8rem 0' }}>
      <Text variant="smallHeading">
        Made possible with{' '}
        <ThemeLink
          variant="styles.shopName"
          sx={{ color: 'inherit', textDecoration: 'none' }}
          href="https://www.takeshape.io"
        >
          <span>Take</span>Shape
        </ThemeLink>
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

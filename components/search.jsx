import { useCallback, useEffect, useRef, useState } from 'react';
import { Box, Input, Link, AspectImage, Flex, Text } from '@theme-ui/components';
import { useLazyQuery } from '@apollo/client';
import { SearchStripeProducts } from 'lib/queries';
import NextLink from 'next/link';
import { ProductPrice } from './products';

export const Search = () => {
  const searchRef = useRef(null);
  const [search, { loading, data }] = useLazyQuery(SearchStripeProducts);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [hasFocus, setHasFocus] = useState(false);

  const onChange = useCallback(
    (event) => {
      setQuery(event.target.value);
    },
    [setQuery]
  );

  useEffect(() => {
    if (query.length > 0) {
      search({ variables: { query } });
    } else {
      setResults([]);
    }
  }, [search, query, setResults]);

  useEffect(() => {
    if (loading || !data) {
      return;
    }

    setResults(data.products.results.filter((result) => result.__typename === 'Stripe_Product'));
  }, [data, loading]);

  const onClick = useCallback(
    (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setHasFocus(false);
      }
    },
    [setHasFocus]
  );

  const resetSearch = useCallback(() => {
    setQuery('');
    setResults([]);
  }, []);

  useEffect(() => {
    window.addEventListener('click', onClick);

    return () => {
      window.removeEventListener('click', onClick);
    };
  }, [onClick]);

  return (
    <Box ref={searchRef} sx={{ position: 'relative' }}>
      <Input onChange={onChange} onFocus={() => setHasFocus(true)} placeholder="Search products" value={query} />
      {hasFocus && results.length > 0 && (
        <Box
          as="ul"
          sx={{
            position: 'absolute',
            zIndex: 10,
            top: '110%',
            left: 0,
            right: 0,
            padding: '0',
            listStyleType: 'none',
            background: 'white',
            borderRadius: '4px',
            border: '1px solid #eee',
            boxShadow: '0 2px 2px 0 rgba(0, 0, 0, .2)'
          }}
        >
          {results.map((product) => {
            const image = product.images[0];
            const price = product.prices.filter((price) => !price.recurring)[0];
            return (
              <Box as="li" key={product.id} onClick={resetSearch}>
                <NextLink href={`/product/${product.id}`} passHref>
                  <Link
                    sx={{
                      display: 'flex',
                      gap: '1rem',
                      alignItems: 'center',
                      padding: '1rem',
                      color: 'black',
                      textDecoration: 'none',
                      ':hover': { backgroundColor: '#eee' }
                    }}
                  >
                    {image && (
                      <Box sx={{ flex: '0 1 3rem', borderRadius: '4px', overflow: 'hidden' }}>
                        <AspectImage src={image} ratio={1} />
                      </Box>
                    )}
                    <Flex sx={{ flexDirection: 'column' }}>
                      <Text sx={{ fontWeight: 'bold', textDecoration: 'underline' }}>{product.name}</Text>
                      {price && (
                        <Text sx={{ fontSize: '.8em', color: '#666' }}>
                          <ProductPrice price={price} />
                        </Text>
                      )}
                    </Flex>
                  </Link>
                </NextLink>
              </Box>
            );
          })}
        </Box>
      )}
    </Box>
  );
};

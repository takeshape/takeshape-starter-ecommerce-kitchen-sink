import { useCallback, useEffect, useRef, useState } from 'react';
import { Input, Link } from '@theme-ui/components';
import { useLazyQuery } from '@apollo/client';
import { SearchStripeProducts } from 'lib/queries';
import debounce from 'lodash/debounce';
import NextLink from 'next/link';

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

  const onClick = useCallback(event => {
    if (searchRef.current && !searchRef.current.contains(event.target)) {
      setHasFocus(false);
    }
  }, [setHasFocus]);

  useEffect(() => {
    window.addEventListener('click', onClick);

    return () => {
      window.removeEventListener('click', onClick);
    }
  }, [onClick])

  return (
    <div ref={searchRef} >
      <Input onChange={debounce(onChange, 200)} onFocus={() => setHasFocus(true)} />
      {hasFocus && results.length > 0 && (
        <ul>
          {results.map((product) => (
            <li key={product.id}>
              <NextLink href={`/product/${product.id}`} passHref>
                <Link>{product.name}</Link>
              </NextLink>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

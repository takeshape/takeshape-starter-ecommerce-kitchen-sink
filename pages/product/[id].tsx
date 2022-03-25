import { NextPage, GetStaticProps, GetStaticPaths } from 'next';
import { Heading, Divider, Alert, Spinner, Container } from '@theme-ui/components';
import { Page } from 'components/layout';
import { ProductCard } from 'components/products';
import { takeshapeApiUrl, takeshapeApiKey } from 'lib/config';
import { createApolloClient } from 'lib/apollo';
import { Stripe_Product } from 'lib/takeshape/types';
import {
  GetStripeProduct,
  GetStripeProductArgs,
  GetStripeProductQuery,
  GetStripeProducts,
  StripeProducts
} from 'lib/queries';

interface ProductPageProps {
  product: Stripe_Product;
}

const ProductPage: NextPage<ProductPageProps> = (props) => {
  return (
    <Page>
      <Heading as="h1">{props.product.name ?? 'Product'}</Heading>
      <Divider />
      <ProductCard product={props.product} />
    </Page>
  );
};

function getSingle<T>(param?: T | T[]): T | undefined {
  if (Array.isArray(param)) {
    return param[0];
  }
  return param;
}

export const getStaticProps: GetStaticProps<ProductPageProps> = async (context) => {
  const { params } = context;
  const id = getSingle(params.id);
  const client = createApolloClient(takeshapeApiUrl, () => takeshapeApiKey);
  const {
    data: { product }
  } = await client.query<GetStripeProductQuery, GetStripeProductArgs>({
    query: GetStripeProduct,
    variables: { id: id }
  });
  return {
    props: {
      product
    }
  };
};

export const getStaticPaths: GetStaticPaths = async () => {
  const client = createApolloClient(takeshapeApiUrl, () => takeshapeApiKey);
  const { data } = await client.query<StripeProducts>({
    query: GetStripeProducts
  });
  const paths = data.products.items.map((product) => ({
    params: { id: product.id }
  }));
  return {
    paths,
    fallback: true
  };
};

export default ProductPage;

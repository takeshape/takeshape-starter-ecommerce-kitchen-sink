import { NextPage, GetStaticProps, GetStaticPaths } from 'next';
import { Heading, Divider } from '@theme-ui/components';
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
import { getSingle } from 'lib/utils/types';

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

export const getStaticProps: GetStaticProps<ProductPageProps> = async (context) => {
  const { params } = context;
  const id = getSingle(params.id);
  const client = createApolloClient(takeshapeApiUrl, () => takeshapeApiKey);
  const {
    data: { product }
  } = await client.query<GetStripeProductQuery, GetStripeProductArgs>({
    query: GetStripeProduct,
    variables: { id }
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

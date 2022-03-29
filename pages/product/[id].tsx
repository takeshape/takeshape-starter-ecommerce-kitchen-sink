import { NextPage, GetStaticProps, GetStaticPaths } from 'next';
import { useRouter } from 'next/router';
import { Heading, Divider } from '@theme-ui/components';
import { Page } from 'components/layout';
import { ProductCard } from 'components/products';
import { takeshapeApiUrl, takeshapeAnonymousApiKey } from 'lib/config';
import { ReviewList } from 'components/reviews';
import { createApolloClient } from 'lib/apollo';
import {
  Stripe_Product,
  Reviews_ProductReviewsQueryResponse,
  Reviews_ProductReview,
  Reviews_Stats,
  QueryGetProductReviewsArgs
} from 'lib/takeshape/types';
import { GetProduct, GetProductArgs, GetProductResponse, GetStripeProducts, StripeProducts } from 'lib/queries';
import { getSingle } from 'lib/utils/types';

interface ProductPageProps {
  product: Stripe_Product;
  reviews: Reviews_ProductReview[] | null;
  stats: Reviews_Stats | null;
}

const ProductPage: NextPage<ProductPageProps> = (props) => {
  const router = useRouter();

  // If the page is not yet generated, this will be displayed
  // initially until getStaticProps() finishes running
  if (router.isFallback) {
    return <div>Loading...</div>;
  }

  const { product, reviews, stats } = props;

  return (
    <Page>
      <Heading as="h1">{product.name ?? 'Product'}</Heading>
      <Divider />
      <ProductCard product={product} />
      <ReviewList reviews={reviews} stats={stats} />
    </Page>
  );
};

export const getStaticProps: GetStaticProps<ProductPageProps> = async (context) => {
  const { params } = context;
  const id = getSingle(params.id);
  const client = createApolloClient(takeshapeApiUrl, () => takeshapeAnonymousApiKey);
  const {
    data: { product, reviews }
  } = await client.query<GetProductResponse, GetProductArgs>({
    query: GetProduct,
    variables: { id }
  });
  return {
    props: {
      product,
      reviews: reviews.reviews.data ?? null,
      stats: reviews.stats ?? null
    }
  };
};

export const getStaticPaths: GetStaticPaths = async () => {
  const client = createApolloClient(takeshapeApiUrl, () => takeshapeAnonymousApiKey);
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

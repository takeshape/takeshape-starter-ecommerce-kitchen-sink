import { NextPage, GetStaticProps, GetStaticPaths } from 'next';
import { useRouter } from 'next/router';
import { Heading, Divider } from '@theme-ui/components';
import { Page } from 'components/layout';
import { ProductCard } from 'components/products';
import { takeshapeApiUrl, takeshapeAnonymousApiKey } from 'lib/config';
import { ReviewList } from 'components/reviews';
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

interface Review {
  score: number;
  title: string;
  content: string;
}

interface ProductPageProps {
  product: Stripe_Product;
  reviews: Review[];
  bottomline: any;
}

const ProductPage: NextPage<ProductPageProps> = (props) => {
  const router = useRouter();

  // If the page is not yet generated, this will be displayed
  // initially until getStaticProps() finishes running
  if (router.isFallback) {
    return <div>Loading...</div>;
  }

  const { product, reviews, bottomline } = props;
  return (
    <Page>
      <Heading as="h1">{product.name ?? 'Product'}</Heading>
      <Divider />
      <ProductCard product={product} />
      <ReviewList reviews={reviews} bottomline={bottomline} />
    </Page>
  );
};

export const getStaticProps: GetStaticProps<ProductPageProps> = async (context) => {
  const { params } = context;
  const id = getSingle(params.id);
  const client = createApolloClient(takeshapeApiUrl, () => takeshapeAnonymousApiKey);
  const {
    data: { product }
  } = await client.query<GetStripeProductQuery, GetStripeProductArgs>({
    query: GetStripeProduct,
    variables: { id }
  });
  return {
    props: {
      product,
      reviews: [
        { score: 5, title: 'I love it', content: 'Greatest product of all time' },
        { score: 3, title: 'It is fine', content: 'I am satisfied' },
        { score: 1, title: 'I hate it', content: 'Worst product of all time' }
      ],
      bottomline: {
        total_review: 11,
        average_score: 3.5
      }
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

import StarRatings from 'react-star-ratings';
import { Box, Flex, Text } from '@theme-ui/components';
import { Reviews_ProductReview, Reviews_Stats } from 'lib/takeshape/types';

export const Review: React.FC<Reviews_ProductReview> = (props) => {
  const { title, review, rating, timeago, date_created } = props;
  return (
    <div>
      <Flex as="header" sx={{ alignItems: 'baseline', gap: '1rem' }}>
        <Box sx={{ marginBottom: '.75em' }}>
          <Text as="h3" sx={{ marginBottom: 0 }}>
            {title}
          </Text>
          <Text as="time" title={date_created} sx={{ fontSize: '.8em', lineHeight: 1, opacity: 0.7 }}>
            {timeago}
          </Text>
        </Box>
        <StarRatings rating={rating} numberOfStars={5} starDimension="20px" starSpacing="2px" />
      </Flex>
      <Text as="p" sx={{ paddingLeft: '1rem' }}>
        {review}
      </Text>
    </div>
  );
};

export interface ReviewListProps {
  reviews: Reviews_ProductReview[] | null;
  stats: Reviews_Stats | null;
}

export const ReviewList: React.FC<ReviewListProps> = (props) => {
  const { reviews, stats } = props;
  if (!reviews?.length) return null;
  return (
    <>
      {stats && (
        <Flex as="header" sx={{ alignItems: 'baseline', gap: '1rem' }}>
          <h2>{stats.count} reviews</h2>
          <StarRatings rating={parseFloat(stats.average)} numberOfStars={5} starDimension="20px" starSpacing="2px" />
        </Flex>
      )}
      <Box as="ul" sx={{ paddingLeft: 0, listStyleType: 'none' }}>
        {reviews.map((review, index) => (
          <Box as="li" sx={{ margin: '2rem' }} key={`review-${index}`}>
            <Review {...review} />
          </Box>
        ))}
      </Box>
    </>
  );
};

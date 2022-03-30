import StarRatings from 'react-star-ratings';
import { Box, Divider, Flex, Text } from '@theme-ui/components';
import { getColor } from '@theme-ui/color';
import { useThemeUI } from '@theme-ui/core';
import { Reviews_ProductReview, Reviews_Stats } from 'lib/takeshape/types';

export const Review: React.FC<Reviews_ProductReview> = (props) => {
  const { title, review, rating, timeago, date_created } = props;
  const { theme } = useThemeUI();
  return (
    <Box>
      <Flex as="header" sx={{ alignItems: 'baseline', gap: '1rem' }}>
        <Box sx={{ marginBottom: '.75em' }}>
          <Text as="h3" sx={{ marginBottom: 0 }}>
            {title}
          </Text>
          <Text as="time" title={date_created} sx={{ fontSize: '.8em', lineHeight: 1, opacity: 0.7 }}>
            {timeago}
          </Text>
        </Box>
        <StarRatings
          rating={rating}
          numberOfStars={5}
          starDimension="14px"
          starSpacing="1px"
          starRatedColor={getColor(theme, 'primary')}
        />
      </Flex>
      <Text as="p">{review}</Text>
    </Box>
  );
};

export interface ReviewListProps {
  reviews: Reviews_ProductReview[] | null;
  stats: Reviews_Stats | null;
}

export const ReviewList: React.FC<ReviewListProps> = (props) => {
  const { reviews, stats } = props;
  const { theme } = useThemeUI();
  if (!reviews?.length) return null;
  return (
    <Box sx={{ margin: '2rem 0' }}>
      {stats?.count && (
        <Flex
          as="header"
          sx={{
            alignItems: 'baseline',
            gap: '1rem'
          }}
        >
          <Text as="h2" sx={{ margin: 0 }}>
            {stats.count} {stats.count > 1 ? 'reviews' : 'review'}
          </Text>
          <StarRatings
            rating={parseFloat(stats.average)}
            numberOfStars={5}
            starDimension="20px"
            starSpacing="2px"
            starRatedColor={getColor(theme, 'primary')}
          />
        </Flex>
      )}
      <Box as="ul" sx={{ paddingLeft: 0, listStyleType: 'none' }}>
        {reviews.map((review, index) => (
          <Box as="li" key={`review-${index}`}>
            <Divider sx={{ margin: '1rem 0' }} />
            <Review {...review} />
          </Box>
        ))}
      </Box>
    </Box>
  );
};

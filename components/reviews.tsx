import StarRatings from 'react-star-ratings';
import { Box, Flex, Text } from '@theme-ui/components';

export const Review = (props) => {
  return (
    <div>
      <Flex as="header" sx={{ alignItems: 'baseline', gap: '1rem' }}>
        <h3>{props.title}</h3>
        <StarRatings rating={props.score} numberOfStars={5} starDimension="20px" starSpacing="2px" />
      </Flex>
      <Text as="p">{props.content}</Text>
    </div>
  );
};

export const ReviewList = (props) => {
  const { reviews, bottomline } = props;
  if (!reviews.length) return null;
  return (
    <>
      <Flex as="header" sx={{ alignItems: 'baseline', gap: '1rem' }}>
        <h2>{bottomline.total_review} reviews</h2>
        <StarRatings rating={bottomline.average_score} numberOfStars={5} starDimension="20px" starSpacing="2px" />
      </Flex>
      <Box as="ul" sx={{ paddingLeft: 0, listStyleType: 'none' }}>
        {reviews.map((review, index) => (
          <Box as="li" sx={{ marginBottom: '2rem' }} key={`review-${index}`}>
            <Review {...review} />
          </Box>
        ))}
      </Box>
    </>
  );
};

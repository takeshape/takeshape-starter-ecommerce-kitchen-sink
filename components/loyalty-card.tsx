import type { Voucherify_LoyaltyCard } from 'lib/takeshape/types';
import { Card, Text, Image, Heading, Box } from '@theme-ui/components';

const LoyaltyCard = ({ code, loyalty_card, assets }: Voucherify_LoyaltyCard) => {
  return (
    <Card variant="loyalty" sx={{ width: '400px', p: 4 }}>
      <Box sx={{ display: 'flex', alignContent: 'center', justifyContent: 'center', mb: 4 }}>
        <Heading sx={{ textAlign: 'center', fontFamily: 'cursive', fontSize: 5 }}>Loyalty Card</Heading>
      </Box>
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Image src={assets.qr.url} alt="QR Code" />
        <Text as="div" sx={{ textTransform: 'uppercase', fontWeight: 'bold', textAlign: 'center' }}>
          {code}
        </Text>
      </Box>
      <Box sx={{ textAlign: 'center' }}>
        <Heading sx={{ textTransform: 'uppercase', fontSize: 1 }}>Balance</Heading>
        <Text sx={{ fontWeight: 'bold' }}>{loyalty_card.balance} points</Text>
      </Box>
    </Card>
  );
};

export default LoyaltyCard;

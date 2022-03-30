import { useState } from 'react';
import {
  Box,
  Button,
  Select,
  Input,
  Label,
  Radio,
  Flex
} from '@theme-ui/components';
import orderBy from 'lodash/orderBy';
import { useCart } from 'lib/cart';
import { pluralizeText, formatPrice } from 'lib/utils/text';
import { Stripe_Product } from 'lib/takeshape/types';

const showCartTimeout = 3000;
const oneTimePurchase = 'one-time';
const recurringPurchase = 'recurring';
const intervalOrderMap = ['day', 'week', 'month', 'year'];

export const ProductPrice = ({ price, quantity }) => {
  quantity = quantity ?? 1;

  const recurringText =
    price.recurring &&
    `every ${pluralizeText(price.recurring.intervalCount, price.recurring.interval, `${price.recurring.interval}s`)}`;

  return (
    <Box sx={{ fontWeight: 'bold', fontSize: '1.3em', lineHeight: '1.8', color: 'text' }}>
      {formatPrice(price.currency, price.unitAmount * quantity)} {recurringText}
    </Box>
  );
};

export const ProductPaymentToggle = ({ purchaseType, onChange }) => {
  return (
    <Box sx={{margin: '1rem 0'}}>
      <Label sx={{display: 'flex', alignItems: 'center', marginBottom: '.5rem'}}>
        <Radio value={oneTimePurchase} checked={purchaseType === oneTimePurchase} onChange={onChange} />
        One-Time Purchase
      </Label>
      <Label sx={{display: 'flex', alignItems: 'center'}}>
        <Radio value={recurringPurchase} checked={purchaseType === recurringPurchase} onChange={onChange} />
        Subscribe &amp; Save!
      </Label>
    </Box>
  );
};

export const Subscription = ({ id, currentPrice, recurringPayments, onChange }) => {
  const inputId = `${id}-subscription`
  return (
    <Box sx={{margin: '1rem 0'}}>
      <Label variant="styles.inputLabel" htmlFor={inputId}>Subscription</Label>
      <Select id={inputId} value={currentPrice.id} onChange={onChange}>
        {recurringPayments.map(({ id, recurring: { interval, intervalCount } }) => (
          <option key={id} value={id}>
            Every {pluralizeText(intervalCount, interval, `${interval}s`)}
          </option>
        ))}
      </Select>
    </Box>
  );
};

export const Quantity = ({ id, defaultValue, onChange }) => {
  const inputId = `${id}-quantity`;
  return (
    <Flex variant="styles.product.quantity" sx={{flexWrap: 'wrap'}}>
      <Label variant="styles.inputLabel" htmlFor={inputId}>Quantity</Label>
      <Input id={inputId} type="number" min={1} defaultValue={defaultValue ?? 1} onChange={onChange} />
    </Flex>
  );
};

const AddToCartButton: React.FC<{onClick: () => void}> = ({onClick}) => (
  <Button sx={{width: '100%', margin: '1rem 0'}} type="button" onClick={onClick}>Add to Cart</Button>
)

function useAddToCart(product: Stripe_Product) {
  const {prices} = product;
  const oneTimePayment = prices?.find((p) => !p.recurring);
  const recurringPayments = orderBy(
    prices?.filter((p) => p.recurring),
    [(v) => intervalOrderMap.indexOf(v.recurring.interval), 'recurring.intervalCount'],
    ['asc', 'asc']
  );
  const findPriceById = (priceId) => prices.find((p) => p.id === priceId);
  const {isCartOpen, actions: { addToCart, openCart, toggleCart }} = useCart();
  const [purchaseType, setPurchaseType] = useState(oneTimePayment ? oneTimePurchase : recurringPurchase);
  const [quantity, setQuantity] = useState(1);
  const [price, setPrice] = useState(oneTimePayment ? oneTimePayment : recurringPayments?.[0]);
  const handleUpdatePurchaseType = (event) => {
    const { value } = event.target;

    setPurchaseType(value);

    if (value === oneTimePurchase) {
      setPrice(oneTimePayment);
    }

    if (value === recurringPurchase) {
      setPrice(recurringPayments[0]);
    }
  };

  const handleUpdateQuantity = (event) => {
    setQuantity(Number(event.target.value));
  };

  const handleUpdateRecurring = (event) => {
    setPurchaseType(recurringPurchase);
    setPrice(findPriceById(event.target.value));
  };

  const handleAddToCart = () => {
    addToCart({ ...product, price, quantity });

    if (!isCartOpen) {
      openCart();
      setTimeout(() => toggleCart(), showCartTimeout);
    }
  };

  return {
    price,
    quantity,
    purchaseType,
    oneTimePayment,
    recurringPayments,
    handleUpdateRecurring,
    handleUpdatePurchaseType,
    handleUpdateQuantity,
    handleAddToCart
  }
}

const AddToCart: React.FC<{product: Stripe_Product}> = ({product}) => {
  const {
    price,
    quantity,
    purchaseType,
    oneTimePayment,
    recurringPayments,
    handleUpdatePurchaseType,
    handleUpdateRecurring,
    handleUpdateQuantity,
    handleAddToCart
  } = useAddToCart(product);
  return (
    <Box>
      

      {oneTimePayment && recurringPayments.length ? (
        <ProductPaymentToggle purchaseType={purchaseType} onChange={handleUpdatePurchaseType} />
      ) : null}
      {recurringPayments.length && purchaseType === recurringPurchase ? (
        <Subscription
          id={product.id}
          currentPrice={price}
          recurringPayments={recurringPayments}
          onChange={handleUpdateRecurring}
        />
      ) : null}

      <Flex sx={{alignItems: "flex-end", gap: "1rem"}}>
        <Quantity id={product.id} defaultValue={quantity} onChange={handleUpdateQuantity} />
        <ProductPrice quantity={quantity} price={price} />
      </Flex>

      <AddToCartButton onClick={handleAddToCart} />
    </Box>
  )
}

export default AddToCart

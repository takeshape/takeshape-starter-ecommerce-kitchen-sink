import { Image } from '@theme-ui/components';

export interface ProductImageProps {
  images: string[];
  maxHeight?: string;
}

const ProductImage: React.FC<ProductImageProps> = (props) => {
  const { images, maxHeight } = props;
  const src = images?.[0];
  if (!src) return null;
  return <Image src={src} sx={{ height: maxHeight, width: '100%', objectFit: 'contain', objectPosition: 'center' }} />;
};

export default ProductImage;

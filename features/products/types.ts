import { Product, ProductVariant, Variant } from '@/generated/prisma';

export type ProductWithVariants = Product & {
  variants: (ProductVariant & {
    variant: Variant;
  })[];
};

export type ProductVariantWithDetails = ProductVariant & {
  product: Product;
  variant: Variant;
};

import { Purchase, ProductVariant } from '@/generated/prisma';

export type PurchaseWithDetails = Purchase & {
  productVariant: ProductVariant & {
    product: {
      id: string;
      name: string;
    };
    variant: {
      id: string;
      name: string;
    };
  };
  createdBy: {
    id: string;
    name: string | null;
    email: string;
  };
};

export interface CreatePurchaseResult {
  purchase: Purchase;
  updatedProductVariant: ProductVariant;
}

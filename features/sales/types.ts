import { Sale, SaleItem } from '@/generated/prisma/client';

export type SaleWithDetails = Sale & {
  items: (SaleItem & {
    productVariant: {
      id: string;
      product: {
        id: string;
        name: string;
      };
      variant: {
        id: string;
        name: string;
      };
      sellingPriceCasier: number;
    };
  })[];
  client: {
    id: string;
    name: string;
    phone: string | null;
  } | null;
  createdBy: {
    id: string;
    name: string | null;
    email: string;
  };
};

export interface CreateSaleResult {
  sale: SaleWithDetails;
}

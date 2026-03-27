import { z } from 'zod';

export const saleItemSchema = z.object({
  productVariantId: z.uuid('ID de variante invalide'),
  quantityHalf: z
    .number()
    .int('La quantité doit être un nombre entier')
    .positive('La quantité doit être positive'),
});

export const createSaleSchema = z.object({
  items: z.array(saleItemSchema).min(1, 'Au moins un article est requis'),
  clientId: z.string().optional(),
  amountPaid: z
    .number()
    .min(0, 'Le montant payé ne peut pas être négatif')
    .default(0),
  notes: z.string().optional(),
});

export type CreateSaleInput = z.infer<typeof createSaleSchema>;
export type SaleItemInput = z.infer<typeof saleItemSchema>;

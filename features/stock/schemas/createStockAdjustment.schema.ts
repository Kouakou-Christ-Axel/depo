import { z } from 'zod';
import { StockMovementType } from '@/generated/prisma';

export const createStockAdjustmentSchema = z.object({
  productVariantId: z.string({
    error: "L'ID de la variante de produit est requis",
  }),
  quantityHalf: z.number().int('La quantité doit être un nombre entier'),
  type: z.enum(StockMovementType),
  notes: z.string().min(1, "Une note est requise pour l'ajustement"),
});

export type CreateStockAdjustmentInput = z.infer<
  typeof createStockAdjustmentSchema
>;

import { z } from 'zod';

export const createPurchaseSchema = z.object({
  productVariantId: z.string({
    error: "L'ID de la variante est requis",
  }),
  quantityCasier: z
    .number()
    .int('La quantité doit être un nombre entier')
    .positive('La quantité doit être positive'),
  purchasePriceCasier: z.number().positive('Le prix doit être positif'),
  supplierName: z.string().optional(),
  invoiceNumber: z.string().optional(),
  notes: z.string().optional(),
});

export type CreatePurchaseInput = z.infer<typeof createPurchaseSchema>;

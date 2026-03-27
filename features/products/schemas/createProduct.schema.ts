import { z } from 'zod';

export const createVariantSchema = z.object({
  name: z.string().min(1, 'Le nom est requis'),
  sizeInMl: z.number().int().positive('La taille doit être positive'),
  description: z.string().optional(),
});

export const createProductSchema = z.object({
  name: z.string().min(1, 'Le nom est requis'),
  description: z.string().optional(),
  variants: z
    .array(
      z.object({
        variantId: z.uuid('ID de variante invalide'),
        casierSize: z
          .number()
          .int()
          .refine((val) => val === 12 || val === 24, {
            message: 'La taille du casier doit être 12 ou 24',
          }),
        sellingPriceCasier: z
          .number()
          .positive('Le prix de vente doit être positif'),
        alertThresholdHalf: z
          .number()
          .int()
          .min(0, "Le seuil d'alerte ne peut pas être négatif")
          .optional(),
      })
    )
    .min(1, 'Au moins une variante est requise'),
});

export type CreateVariantInput = z.infer<typeof createVariantSchema>;
export type CreateProductInput = z.infer<typeof createProductSchema>;

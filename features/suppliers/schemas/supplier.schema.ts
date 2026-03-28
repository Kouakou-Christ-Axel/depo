import { z } from 'zod';

export const createSupplierSchema = z.object({
  name: z.string().min(1, 'Le nom est requis'),
  phone: z.string().optional(),
  email: z.string().email('Email invalide').optional().or(z.literal('')),
  address: z.string().optional(),
});

export type CreateSupplierInput = z.infer<typeof createSupplierSchema>;

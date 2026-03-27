import { z } from 'zod';

export const recordClientPaymentSchema = z.object({
  clientId: z.uuid('ID client invalide'),
  amount: z.number().positive('Le montant doit être positif'),
  method: z.string().optional(),
  reference: z.string().optional(),
  notes: z.string().optional(),
  paymentDate: z.date().optional(),
});

export type RecordClientPaymentInput = z.infer<
  typeof recordClientPaymentSchema
>;

export const createClientSchema = z.object({
  name: z.string().min(1, 'Le nom est requis'),
  phone: z.string().optional(),
  address: z.string().optional(),
  email: z.string().email('Email invalide').optional(),
});

export type CreateClientInput = z.infer<typeof createClientSchema>;

import { z } from 'zod';

export const createExpenseSchema = z.object({
  category: z.string().min(1, 'La catégorie est requise'),
  description: z.string().min(1, 'La description est requise'),
  amount: z.number().positive('Le montant doit être positif'),
  expenseDate: z.string().optional(),
});

export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;

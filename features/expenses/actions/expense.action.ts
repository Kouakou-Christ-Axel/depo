'use server';

import { requireAnyRole } from '@/lib/auth-helpers';
import { UserRole } from '@/generated/prisma/client';
import {
  createExpenseSchema,
  CreateExpenseInput,
} from '../schemas/expense.schema';
import { createExpense } from '../service';

export async function createExpenseAction(input: CreateExpenseInput) {
  try {
    const user = await requireAnyRole([UserRole.ADMIN, UserRole.SECRETAIRE]);
    const validated = createExpenseSchema.parse(input);
    const expense = await createExpense(validated, user.id);
    return { success: true, data: { id: expense.id } };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue',
    };
  }
}

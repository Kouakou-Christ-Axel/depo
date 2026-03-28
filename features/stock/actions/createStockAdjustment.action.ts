'use server';

import { requireAnyRole } from '@/lib/auth-helpers';
import { UserRole } from '@/generated/prisma/client';
import {
  createStockAdjustmentSchema,
  CreateStockAdjustmentInput,
} from '../schemas/createStockAdjustment.schema';
import { createStockAdjustment } from '../service';

export async function createStockAdjustmentAction(
  input: CreateStockAdjustmentInput
) {
  try {
    const user = await requireAnyRole([
      UserRole.ADMIN,
      UserRole.GESTIONNAIRE_STOCK,
    ]);
    const validatedInput = createStockAdjustmentSchema.parse(input);
    const result = await createStockAdjustment(validatedInput, user.id);
    return { success: true, data: result };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue',
    };
  }
}

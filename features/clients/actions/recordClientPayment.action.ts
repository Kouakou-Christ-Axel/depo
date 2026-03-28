'use server';

import { requireAnyRole } from '@/lib/auth-helpers';
import { UserRole } from '@/generated/prisma/client';
import {
  recordClientPaymentSchema,
  RecordClientPaymentInput,
} from '../schemas/recordClientPayment.schema';
import { recordClientPayment } from '../service';

export async function recordClientPaymentAction(
  input: RecordClientPaymentInput
) {
  try {
    const user = await requireAnyRole([UserRole.ADMIN, UserRole.SECRETAIRE]);
    const validatedInput = recordClientPaymentSchema.parse(input);
    const result = await recordClientPayment(validatedInput, user.id);
    return { success: true, data: result };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue',
    };
  }
}

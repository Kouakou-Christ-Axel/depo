'use server';

import { requireAnyRole } from '@/lib/auth-helpers';
import { UserRole } from '@/generated/prisma/client';
import {
  createClientSchema,
  CreateClientInput,
} from '../schemas/recordClientPayment.schema';
import { createClient } from '../service';

export async function createClientAction(input: CreateClientInput) {
  try {
    await requireAnyRole([UserRole.ADMIN, UserRole.SECRETAIRE, UserRole.VENDEUR]);
    const validated = createClientSchema.parse(input);
    const client = await createClient(validated);
    return { success: true, data: { id: client.id, name: client.name } };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue',
    };
  }
}

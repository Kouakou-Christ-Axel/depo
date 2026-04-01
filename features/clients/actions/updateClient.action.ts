'use server';

import { requireAnyRole } from '@/lib/auth-helpers';
import { UserRole } from '@/generated/prisma/client';
import { updateClient } from '../service';

export async function updateClientAction(
  id: string,
  input: { name?: string; phone?: string; email?: string; address?: string }
) {
  try {
    await requireAnyRole([UserRole.ADMIN, UserRole.SECRETAIRE]);
    const client = await updateClient(id, input);
    return { success: true, data: { id: client.id } };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue',
    };
  }
}

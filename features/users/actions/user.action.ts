'use server';

import { requireRole } from '@/lib/auth-helpers';
import { UserRole } from '@/generated/prisma/client';
import { updateUserRole } from '../service';

export async function updateUserRoleAction(
  userId: string,
  role: string | null
) {
  try {
    await requireRole(UserRole.ADMIN);

    const validRole = role
      ? (Object.values(UserRole) as string[]).includes(role)
        ? (role as UserRole)
        : null
      : null;

    await updateUserRole(userId, validRole);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue',
    };
  }
}

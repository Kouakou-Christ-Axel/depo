import prisma from '@/lib/prisma';
import { UserRole } from '@/generated/prisma/client';

/**
 * Lister tous les utilisateurs
 */
export async function listUsers() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      emailVerified: true,
      createdAt: true,
    },
  });

  return users.map((u) => ({
    ...u,
    createdAt: u.createdAt.toISOString(),
  }));
}

/**
 * Mettre à jour le rôle d'un utilisateur
 */
export async function updateUserRole(userId: string, role: UserRole | null) {
  return prisma.user.update({
    where: { id: userId },
    data: { role },
  });
}

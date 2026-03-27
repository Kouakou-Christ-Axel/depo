import { auth } from '@/lib/auth';
import { UserRole } from '@/generated/prisma';
import { headers } from 'next/headers';

/**
 * Récupère la session utilisateur courante
 */
export async function getCurrentUser() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return session?.user ?? null;
}

/**
 * Vérifie que l'utilisateur est authentifié
 */
export async function requireAuth() {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('Non authentifié');
  }

  return user;
}

/**
 * Vérifie si l'utilisateur a le rôle requis
 */
export async function requireRole(role: UserRole) {
  const user = await requireAuth();

  if (user.role !== role) {
    throw new Error(`Accès refusé. Rôle requis : ${role}`);
  }

  return user;
}

/**
 * Vérifie si l'utilisateur a l'un des rôles requis
 */
export async function requireAnyRole(roles: UserRole[]) {
  const user = await requireAuth();

  if (!roles.includes(user.role as UserRole)) {
    throw new Error(`Accès refusé. Rôles autorisés : ${roles.join(', ')}`);
  }

  return user;
}

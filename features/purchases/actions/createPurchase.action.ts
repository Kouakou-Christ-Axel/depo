'use server';

import { requireAnyRole } from '@/lib/auth-helpers';
import { UserRole } from '@/generated/prisma';
import {
  createPurchaseSchema,
  CreatePurchaseInput,
} from '../schemas/createPurchase.schema';
import { createPurchase } from '../service';

/**
 * Server Action : Créer un achat fournisseur
 * Permissions : ADMIN ou GESTIONNAIRE_STOCK
 */
export async function createPurchaseAction(input: CreatePurchaseInput) {
  try {
    // 1. Vérifier les permissions
    const user = await requireAnyRole([
      UserRole.ADMIN,
      UserRole.GESTIONNAIRE_STOCK,
    ]);

    // 2. Valider l'input
    const validatedInput = createPurchaseSchema.parse(input);

    // 3. Créer l'achat
    const result = await createPurchase(validatedInput, user.id);

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue',
    };
  }
}

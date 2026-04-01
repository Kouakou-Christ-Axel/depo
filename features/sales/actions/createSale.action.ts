'use server';

import { requireAnyRole } from '@/lib/auth-helpers';
import { UserRole } from '@/generated/prisma/client';
import {
  createSaleSchema,
  CreateSaleInput,
} from '../schemas/createSale.schema';
import { createSale } from '../service';

/**
 * Server Action : Créer une vente
 * Permissions : ADMIN, SECRETAIRE, VENDEUR
 */
export async function createSaleAction(input: CreateSaleInput) {
  try {
    // 1. Vérifier les permissions
    const user = await requireAnyRole([
      UserRole.ADMIN,
      UserRole.SECRETAIRE,
      UserRole.VENDEUR,
    ]);

    // 2. Valider l'input
    const validatedInput = createSaleSchema.parse(input);

    // 3. Créer la vente
    const result = await createSale(validatedInput, user.id);

    return {
      success: true,
      // Keep Server Action payload JSON-safe for Client Components.
      data: { saleId: result.sale.id },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue',
    };
  }
}

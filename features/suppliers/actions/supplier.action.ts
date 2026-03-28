'use server';

import { requireAnyRole } from '@/lib/auth-helpers';
import { UserRole } from '@/generated/prisma/client';
import {
  createSupplierSchema,
  CreateSupplierInput,
} from '../schemas/supplier.schema';
import { createSupplier, deactivateSupplier } from '../service';

export async function createSupplierAction(input: CreateSupplierInput) {
  try {
    await requireAnyRole([UserRole.ADMIN, UserRole.GESTIONNAIRE_STOCK]);
    const validated = createSupplierSchema.parse(input);
    console.log("validated", validated);
    const supplier = await createSupplier({
      name: validated.name,
      phone: validated.phone || undefined,
      email: validated.email || undefined,
      address: validated.address || undefined,
    });

    console.log("supplier", supplier);

    return { success: true, data: supplier };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue',
    };
  }
}

export async function deactivateSupplierAction(id: string) {
  try {
    await requireAnyRole([UserRole.ADMIN]);
    await deactivateSupplier(id);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue',
    };
  }
}

'use server';

import { requireRole } from '@/lib/auth-helpers';
import { UserRole } from '@/generated/prisma/enums';
import {
  CreateProductInput,
  createProductSchema,
  CreateVariantInput,
  createVariantSchema,
} from '../schemas/createProduct.schema';
import { createProduct, createVariant } from '../service';

export async function createVariantAction(input: CreateVariantInput) {
  try {
    await requireRole(UserRole.ADMIN);
    const validatedInput = createVariantSchema.parse(input);
    const variant = await createVariant(validatedInput);
    return { success: true, data: { id: variant.id } };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue',
    };
  }
}

export async function createProductAction(input: CreateProductInput) {
  try {
    await requireRole(UserRole.ADMIN);
    const validatedInput = createProductSchema.parse(input);
    const product = await createProduct(validatedInput);
    return { success: true, data: { id: product.id } };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue',
    };
  }
}

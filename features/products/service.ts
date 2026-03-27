import prisma from '@/lib/prisma';
import {
  CreateVariantInput,
  CreateProductInput,
} from './schemas/createProduct.schema';
import { ProductWithVariants, ProductVariantWithDetails } from './types';
import { Decimal } from '@prisma/client-runtime-utils';

/**
 * Créer une variante globale (33cl, 66cl, etc.)
 */
export async function createVariant(input: CreateVariantInput) {
  return await prisma.variant.create({
    data: {
      name: input.name,
      sizeInMl: input.sizeInMl,
      description: input.description,
    },
  });
}

/**
 * Lister toutes les variantes
 */
export async function listVariants() {
  return await prisma.variant.findMany({
    orderBy: { sizeInMl: 'asc' },
  });
}

/**
 * Créer un produit avec ses variantes
 */
export async function createProduct(
  input: CreateProductInput
): Promise<ProductWithVariants> {
  return await prisma.product.create({
    data: {
      name: input.name,
      description: input.description,
      variants: {
        create: input.variants.map((v) => ({
          variantId: v.variantId,
          casierSize: v.casierSize,
          sellingPriceCasier: new Decimal(v.sellingPriceCasier),
          alertThresholdHalf: v.alertThresholdHalf || 10,
        })),
      },
    },
    include: {
      variants: {
        include: {
          variant: true,
        },
      },
    },
  });
}

/**
 * Lister tous les produits avec leurs variantes
 */
export async function listProducts(
  includeInactive = false
): Promise<ProductWithVariants[]> {
  return await prisma.product.findMany({
    where: includeInactive ? {} : { isActive: true },
    include: {
      variants: {
        where: includeInactive ? {} : { isActive: true },
        include: {
          variant: true,
        },
      },
    },
    orderBy: { name: 'asc' },
  });
}

/**
 * Récupérer un produit par ID
 */
export async function getProductById(
  id: string
): Promise<ProductWithVariants | null> {
  return await prisma.product.findUnique({
    where: { id },
    include: {
      variants: {
        include: {
          variant: true,
        },
      },
    },
  });
}

/**
 * Lister toutes les variantes de produits (pour le stock)
 */
export async function listProductVariants(
  includeInactive = false
): Promise<ProductVariantWithDetails[]> {
  return await prisma.productVariant.findMany({
    where: includeInactive ? {} : { isActive: true },
    include: {
      product: true,
      variant: true,
    },
    orderBy: [{ product: { name: 'asc' } }, { variant: { sizeInMl: 'asc' } }],
  });
}

/**
 * Récupérer une variante de produit par ID
 */
export async function getProductVariantById(
  id: string
): Promise<ProductVariantWithDetails | null> {
  return await prisma.productVariant.findUnique({
    where: { id },
    include: {
      product: true,
      variant: true,
    },
  });
}

/**
 * Mettre à jour le prix de vente d'une variante de produit
 */
export async function updateProductVariantPrice(
  id: string,
  sellingPriceCasier: number
) {
  return await prisma.productVariant.update({
    where: { id },
    data: {
      sellingPriceCasier: new Decimal(sellingPriceCasier),
    },
  });
}

/**
 * Désactiver un produit
 */
export async function deactivateProduct(id: string) {
  return await prisma.product.update({
    where: { id },
    data: { isActive: false },
  });
}

/**
 * Récupérer les produits en rupture de stock
 */
export async function getProductsLowStock() {
  return await prisma.productVariant.findMany({
    where: {
      isActive: true,
      product: {
        isActive: true,
      },
      stockHalf: {
        lte: prisma.productVariant.fields.alertThresholdHalf,
      },
    },
    include: {
      product: true,
      variant: true,
    },
    orderBy: { stockHalf: 'asc' },
  });
}

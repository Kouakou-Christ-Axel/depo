import prisma from '@/lib/prisma';
import { CreatePurchaseInput } from './schemas/createPurchase.schema';
import { CreatePurchaseResult, PurchaseWithDetails } from './types';
import { StockMovementType } from '@/generated/prisma/client';
import { Decimal } from '@prisma/client/runtime/client';

/**
 * Créer un achat fournisseur
 * - Met à jour le stock (en demi-casiers)
 * - Recalcule le coût moyen pondéré
 * - Crée un mouvement de stock IN
 */
export async function createPurchase(
  input: CreatePurchaseInput,
  createdById: string
): Promise<CreatePurchaseResult> {
  return prisma.$transaction(async (tx) => {
    // 1. Récupérer la variante produit
    const productVariant = await tx.productVariant.findUnique({
      where: { id: input.productVariantId },
    });

    if (!productVariant) {
      throw new Error('Variante de produit introuvable');
    }

    if (!productVariant.isActive) {
      throw new Error('Cette variante de produit est désactivée');
    }

    // 2. Calculer les quantités
    const quantityHalf = input.quantityCasier * 2; // Conversion en demi-casiers
    const totalAmount = input.purchasePriceCasier * input.quantityCasier;

    // 3. Calculer le nouveau coût moyen pondéré
    const oldStockCasier = productVariant.stockHalf / 2;
    const oldCost = Number(productVariant.averageCostCasier);
    const newQuantityCasier = input.quantityCasier;
    const newPurchasePrice = input.purchasePriceCasier;

    let newAverageCost: number;

    if (oldStockCasier === 0) {
      // Pas de stock ancien → le nouveau coût moyen = prix d'achat
      newAverageCost = newPurchasePrice;
    } else {
      // Formule du coût moyen pondéré
      newAverageCost =
        (oldStockCasier * oldCost + newQuantityCasier * newPurchasePrice) /
        (oldStockCasier + newQuantityCasier);
    }

    // 4. Nouveau stock
    const newStockHalf = productVariant.stockHalf + quantityHalf;

    // 5. Créer l'achat
    const purchase = await tx.purchase.create({
      data: {
        productVariantId: input.productVariantId,
        quantityCasier: input.quantityCasier,
        purchasePriceCasier: new Decimal(input.purchasePriceCasier),
        totalAmount: new Decimal(totalAmount),
        supplierName: input.supplierName,
        invoiceNumber: input.invoiceNumber,
        notes: input.notes,
        createdById,
      },
    });

    // 6. Mettre à jour le stock et le coût moyen
    const updatedProductVariant = await tx.productVariant.update({
      where: { id: input.productVariantId },
      data: {
        stockHalf: newStockHalf,
        averageCostCasier: new Decimal(newAverageCost.toFixed(2)),
      },
    });

    // 7. Créer le mouvement de stock
    await tx.stockMovement.create({
      data: {
        productVariantId: input.productVariantId,
        type: StockMovementType.IN,
        quantityHalf,
        stockAfter: newStockHalf,
        referenceId: purchase.id,
        notes: `Achat fournisseur - ${input.quantityCasier} casier(s)`,
        createdById,
      },
    });

    return {
      purchase,
      updatedProductVariant,
    };
  });
}

export interface ListPurchasesParams {
  page?: number;
  perPage?: number;
  search?: string;
  productVariantId?: string;
  supplierName?: string;
}

export interface PaginatedPurchases {
  data: PurchaseWithDetails[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}

/**
 * Lister tous les achats avec détails (paginé + filtres)
 */
export async function listPurchases(
  params: ListPurchasesParams = {}
): Promise<PaginatedPurchases> {
  const { page = 1, perPage = 20, search, productVariantId, supplierName } = params;
  const skip = (page - 1) * perPage;

  const where: Record<string, unknown> = {};

  if (productVariantId) {
    where.productVariantId = productVariantId;
  }

  if (supplierName) {
    where.supplierName = { contains: supplierName, mode: 'insensitive' };
  }

  if (search) {
    where.OR = [
      { supplierName: { contains: search, mode: 'insensitive' } },
      { invoiceNumber: { contains: search, mode: 'insensitive' } },
      { productVariant: { product: { name: { contains: search, mode: 'insensitive' } } } },
    ];
  }

  const [data, total] = await Promise.all([
    prisma.purchase.findMany({
      where,
      take: perPage,
      skip,
      orderBy: { createdAt: 'desc' },
      include: {
        productVariant: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
              },
            },
            variant: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    }),
    prisma.purchase.count({ where }),
  ]);

  return {
    data,
    total,
    page,
    perPage,
    totalPages: Math.ceil(total / perPage),
  };
}

/**
 * Récupérer un achat par ID
 */
export async function getPurchaseById(
  id: string
): Promise<PurchaseWithDetails | null> {
  return prisma.purchase.findUnique({
    where: { id },
    include: {
      productVariant: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
            },
          },
          variant: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
      createdBy: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });
}

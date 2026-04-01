import prisma from '@/lib/prisma';
import { CreateStockAdjustmentInput } from './schemas/createStockAdjustment.schema';
import { StockMovementType } from '@/generated/prisma/client';

/**
 * Créer un ajustement de stock manuel
 * Utilisé pour les pertes, casses, ou corrections
 */
export async function createStockAdjustment(
  input: CreateStockAdjustmentInput,
  createdById: string
) {
  return prisma.$transaction(async (tx) => {
    // Vérifier que la variante existe
    const productVariant = await tx.productVariant.findUnique({
      where: { id: input.productVariantId },
      include: {
        product: true,
        variant: true,
      },
    });

    if (!productVariant) {
      throw new Error('Variante de produit introuvable');
    }

    // Pour les types LOSS et ADJUSTMENT qui diminuent le stock
    if (
      (input.type === StockMovementType.LOSS ||
        input.type === StockMovementType.ADJUSTMENT) &&
      input.quantityHalf < 0
    ) {
      const availableStock = productVariant.stockHalf;
      if (Math.abs(input.quantityHalf) > availableStock) {
        throw new Error(
          `Stock insuffisant. Disponible : ${availableStock} demi-casiers`
        );
      }
    }

    // Calculer le nouveau stock
    const newStockHalf = productVariant.stockHalf + input.quantityHalf;

    if (newStockHalf < 0) {
      throw new Error('Le stock ne peut pas être négatif');
    }

    // Mettre à jour le stock
    const updatedProductVariant = await tx.productVariant.update({
      where: { id: input.productVariantId },
      data: {
        stockHalf: newStockHalf,
      },
    });

    // Créer le mouvement de stock
    const stockMovement = await tx.stockMovement.create({
      data: {
        productVariantId: input.productVariantId,
        type: input.type,
        quantityHalf: input.quantityHalf,
        stockAfter: newStockHalf,
        notes: input.notes,
        createdById,
      },
      include: {
        productVariant: {
          include: {
            product: true,
            variant: true,
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

    return {
      stockMovement,
      updatedProductVariant,
    };
  });
}

export interface ListStockMovementsParams {
  page?: number;
  perPage?: number;
  type?: StockMovementType;
  search?: string;
}

/**
 * Lister les mouvements de stock (paginé)
 */
export async function listStockMovements(params: ListStockMovementsParams = {}) {
  const { page = 1, perPage = 20, type, search } = params;
  const skip = (page - 1) * perPage;

  const where: Record<string, unknown> = {};
  if (type) where.type = type;
  if (search) {
    where.OR = [
      { productVariant: { product: { name: { contains: search, mode: 'insensitive' } } } },
      { notes: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [data, total] = await Promise.all([
    prisma.stockMovement.findMany({
      where,
      take: perPage,
      skip,
      include: {
        productVariant: {
          include: {
            product: { select: { id: true, name: true } },
            variant: { select: { id: true, name: true } },
          },
        },
        createdBy: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.stockMovement.count({ where }),
  ]);

  return {
    data: data.map((m) => ({
      id: m.id,
      type: m.type,
      quantityHalf: m.quantityHalf,
      stockAfter: m.stockAfter,
      notes: m.notes,
      createdAt: m.createdAt.toISOString(),
      productName: m.productVariant.product.name,
      variantName: m.productVariant.variant.name,
      createdByName: m.createdBy.name || m.createdBy.email,
    })),
    total,
    page,
    perPage,
    totalPages: Math.ceil(total / perPage),
  };
}

/**
 * Statistiques de stock
 */
export async function getStockStats() {
  const [variants, movements] = await Promise.all([
    prisma.productVariant.findMany({
      where: { isActive: true, product: { isActive: true } },
      include: { product: true, variant: true },
    }),
    prisma.stockMovement.groupBy({
      by: ['type'],
      _sum: { quantityHalf: true },
      _count: true,
    }),
  ]);

  const totalStockCasier = variants.reduce((s, v) => s + v.stockHalf / 2, 0);
  const totalValue = variants.reduce(
    (s, v) => s + (v.stockHalf / 2) * Number(v.averageCostCasier),
    0
  );
  const lowStockCount = variants.filter(
    (v) => v.stockHalf <= v.alertThresholdHalf
  ).length;
  const outOfStockCount = variants.filter((v) => v.stockHalf === 0).length;

  const movementsByType = Object.fromEntries(
    movements.map((m) => [
      m.type,
      { count: m._count, totalHalf: m._sum.quantityHalf ?? 0 },
    ])
  );

  return {
    totalProducts: variants.length,
    totalStockCasier,
    totalValue,
    lowStockCount,
    outOfStockCount,
    movements: movementsByType as Record<
      string,
      { count: number; totalHalf: number }
    >,
  };
}

/**
 * Récupérer un mouvement de stock par ID
 */
export async function getStockMovementById(id: string) {
  return await prisma.stockMovement.findUnique({
    where: { id },
    include: {
      productVariant: {
        include: {
          product: true,
          variant: true,
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

import prisma from '@/lib/prisma';
import { CreateStockAdjustmentInput } from './schemas/createStockAdjustment.schema';
import { StockMovementType } from '@/generated/prisma';

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

/**
 * Lister les mouvements de stock
 */
export async function listStockMovements(
  limit = 50,
  offset = 0,
  filters?: {
    productVariantId?: string;
    type?: StockMovementType;
  }
) {
  return await prisma.stockMovement.findMany({
    take: limit,
    skip: offset,
    where: {
      productVariantId: filters?.productVariantId,
      type: filters?.type,
    },
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
    orderBy: { createdAt: 'desc' },
  });
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

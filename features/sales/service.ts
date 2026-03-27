import prisma from '@/lib/prisma';
import { CreateSaleInput } from './schemas/createSale.schema';
import { CreateSaleResult, SaleWithDetails } from './types';
import { SaleStatus, StockMovementType } from '@/generated/prisma';
import { Decimal } from '@prisma/client-runtime-utils';

/**
 * Générer un numéro de vente unique (ex: VT-2026-0001)
 */
async function generateSaleNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `VT-${year}-`;

  // Récupérer le dernier numéro de vente de l'année
  const lastSale = await prisma.sale.findFirst({
    where: {
      saleNumber: {
        startsWith: prefix,
      },
    },
    orderBy: {
      saleNumber: 'desc',
    },
  });

  let nextNumber = 1;
  if (lastSale) {
    const lastNumber = parseInt(lastSale.saleNumber.split('-')[2]);
    nextNumber = lastNumber + 1;
  }

  return `${prefix}${nextNumber.toString().padStart(4, '0')}`;
}

/**
 * Créer une vente
 * - Vérifie le stock disponible
 * - Décrément le stock
 * - Crée les mouvements de stock
 * - Met à jour la dette client si nécessaire
 */
export async function createSale(input: CreateSaleInput, createdById: string) {
  return prisma.$transaction(async (tx) => {
    // 1. Vérifier le stock pour chaque item
    for (const item of input.items) {
      const productVariant = await tx.productVariant.findUnique({
        where: { id: item.productVariantId },
        include: {
          product: true,
          variant: true,
        },
      });

      if (!productVariant) {
        throw new Error(
          `Variante de produit introuvable : ${item.productVariantId}`
        );
      }

      if (!productVariant.isActive) {
        throw new Error(
          `${productVariant.product.name} (${productVariant.variant.name}) est désactivé`
        );
      }

      if (productVariant.stockHalf < item.quantityHalf) {
        throw new Error(
          `Stock insuffisant pour ${productVariant.product.name} (${productVariant.variant.name}). ` +
            `Disponible : ${productVariant.stockHalf} demi-casiers, ` +
            `Demandé : ${item.quantityHalf} demi-casiers`
        );
      }
    }

    // 2. Calculer le total et préparer les items
    let totalAmount = 0;
    const saleItemsData = [];

    for (const item of input.items) {
      const productVariant = await tx.productVariant.findUnique({
        where: { id: item.productVariantId },
      });

      if (!productVariant) {
        throw new Error('Variante de produit introuvable');
      }

      // Prix unitaire par demi-casier = sellingPriceCasier / 2
      const unitPrice = Number(productVariant.sellingPriceCasier) / 2;
      const subtotal = unitPrice * item.quantityHalf;

      totalAmount += subtotal;

      saleItemsData.push({
        productVariantId: item.productVariantId,
        quantityHalf: item.quantityHalf,
        unitPrice: new Decimal(unitPrice.toFixed(2)),
        subtotal: new Decimal(subtotal.toFixed(2)),
      });
    }

    // 3. Déterminer le statut
    const amountPaid = input.amountPaid || 0;
    let status: SaleStatus;

    if (amountPaid >= totalAmount) {
      status = SaleStatus.PAID;
    } else if (amountPaid > 0) {
      status = SaleStatus.PARTIAL;
    } else {
      status = SaleStatus.UNPAID;
    }

    // 4. Générer le numéro de vente
    const saleNumber = await generateSaleNumber();

    // 5. Créer la vente
    const sale = await tx.sale.create({
      data: {
        saleNumber,
        clientId: input.clientId,
        totalAmount: new Decimal(totalAmount.toFixed(2)),
        amountPaid: new Decimal(amountPaid.toFixed(2)),
        status,
        notes: input.notes,
        createdById,
        items: {
          create: saleItemsData,
        },
      },
      include: {
        items: {
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
          },
        },
        client: {
          select: {
            id: true,
            name: true,
            phone: true,
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

    // 6. Décrémenter le stock et créer les mouvements
    for (const item of input.items) {
      const productVariant = await tx.productVariant.findUnique({
        where: { id: item.productVariantId },
      });

      if (!productVariant) continue;

      const newStockHalf = productVariant.stockHalf - item.quantityHalf;

      await tx.productVariant.update({
        where: { id: item.productVariantId },
        data: {
          stockHalf: newStockHalf,
        },
      });

      await tx.stockMovement.create({
        data: {
          productVariantId: item.productVariantId,
          type: StockMovementType.OUT,
          quantityHalf: -item.quantityHalf, // Négatif pour sortie
          stockAfter: newStockHalf,
          referenceId: sale.id,
          notes: `Vente ${saleNumber}`,
          createdById,
        },
      });
    }

    // 7. Mettre à jour la dette client si nécessaire
    if (input.clientId && status !== SaleStatus.PAID) {
      const amountDue = totalAmount - amountPaid;

      await tx.client.update({
        where: { id: input.clientId },
        data: {
          debtTotal: {
            increment: new Decimal(amountDue.toFixed(2)),
          },
        },
      });
    }

    return { sale };
  });
}

/**
 * Lister toutes les ventes avec détails
 */
export async function listSales(
  limit = 50,
  offset = 0,
  filters?: {
    status?: SaleStatus;
    clientId?: string;
  }
) {
  return prisma.sale.findMany({
    take: limit,
    skip: offset,
    where: {
      status: filters?.status,
      clientId: filters?.clientId,
    },
    orderBy: { createdAt: 'desc' },
    include: {
      items: {
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
        },
      },
      client: {
        select: {
          id: true,
          name: true,
          phone: true,
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

/**
 * Récupérer une vente par ID
 */
export async function getSaleById(id: string) {
  return prisma.sale.findUnique({
    where: { id },
    include: {
      items: {
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
        },
      },
      client: {
        select: {
          id: true,
          name: true,
          phone: true,
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

/**
 * Récupérer une vente par numéro
 */
export async function getSaleBySaleNumber(saleNumber: string) {
  return prisma.sale.findUnique({
    where: { saleNumber },
    include: {
      items: {
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
        },
      },
      client: {
        select: {
          id: true,
          name: true,
          phone: true,
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

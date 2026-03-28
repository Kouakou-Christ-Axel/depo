import prisma from '@/lib/prisma';

export interface ListSuppliersParams {
  page?: number;
  perPage?: number;
  search?: string;
  includeInactive?: boolean;
}

export interface PaginatedSuppliers {
  data: Awaited<ReturnType<typeof prisma.supplier.findMany>>;
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}

/**
 * Lister les fournisseurs (paginé + filtres)
 */
export async function listSuppliers(
  params: ListSuppliersParams = {}
): Promise<PaginatedSuppliers> {
  const { page = 1, perPage = 20, search, includeInactive = false } = params;
  const skip = (page - 1) * perPage;

  const where: Record<string, unknown> = {};

  if (!includeInactive) {
    where.isActive = true;
  }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { phone: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [data, total] = await Promise.all([
    prisma.supplier.findMany({
      where,
      take: perPage,
      skip,
      orderBy: { name: 'asc' },
    }),
    prisma.supplier.count({ where }),
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
 * Lister tous les fournisseurs actifs (pour les selects)
 */
export async function listAllActiveSuppliers() {
  return prisma.supplier.findMany({
    where: { isActive: true },
    orderBy: { name: 'asc' },
    select: { id: true, name: true },
  });
}

/**
 * Créer un fournisseur
 */
export async function createSupplier(input: {
  name: string;
  phone?: string;
  email?: string;
  address?: string;
}) {
  return prisma.supplier.create({ data: input });
}

/**
 * Mettre à jour un fournisseur
 */
export async function updateSupplier(
  id: string,
  input: { name?: string; phone?: string; email?: string; address?: string }
) {
  return prisma.supplier.update({ where: { id }, data: input });
}

/**
 * Désactiver un fournisseur
 */
export async function deactivateSupplier(id: string) {
  return prisma.supplier.update({
    where: { id },
    data: { isActive: false },
  });
}

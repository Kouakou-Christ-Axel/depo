import prisma from '@/lib/prisma';
import {
  RecordClientPaymentInput,
  CreateClientInput,
} from './schemas/recordClientPayment.schema';
import { RecordClientPaymentResult, ClientWithDetails } from './types';
import { SaleStatus } from '@/generated/prisma/client';
import { Decimal } from '@prisma/client/runtime/client';

/**
 * Enregistrer un paiement client
 * - Réduit la dette du client
 * - Alloue le paiement aux ventes impayées (FIFO, plus anciennes d'abord)
 * - Met à jour le statut des ventes concernées
 */
export async function recordClientPayment(
  input: RecordClientPaymentInput,
  createdById: string
): Promise<RecordClientPaymentResult> {
  return await prisma.$transaction(async (tx) => {
    // 1. Vérifier que le client existe
    const client = await tx.client.findUnique({
      where: { id: input.clientId },
    });

    if (!client) {
      throw new Error('Client introuvable');
    }

    if (!client.isActive) {
      throw new Error('Ce client est désactivé');
    }

    // 2. Créer le paiement
    const payment = await tx.clientPayment.create({
      data: {
        clientId: input.clientId,
        amount: new Decimal(input.amount),
        method: input.method,
        reference: input.reference,
        notes: input.notes,
        paymentDate: input.paymentDate || new Date(),
        createdById,
      },
    });

    // 3. Allouer le paiement aux ventes impayées (FIFO)
    const unpaidSales = await tx.sale.findMany({
      where: {
        clientId: input.clientId,
        status: { in: [SaleStatus.UNPAID, SaleStatus.PARTIAL] },
      },
      orderBy: { createdAt: 'asc' },
    });

    let remainingPayment = input.amount;

    for (const sale of unpaidSales) {
      if (remainingPayment <= 0) break;

      const saleTotal = Number(sale.totalAmount);
      const salePaid = Number(sale.amountPaid);
      const saleDue = saleTotal - salePaid;

      if (saleDue <= 0) continue;

      const allocated = Math.min(remainingPayment, saleDue);
      const newPaid = salePaid + allocated;

      let newStatus: SaleStatus;
      if (newPaid >= saleTotal) {
        newStatus = SaleStatus.PAID;
      } else if (newPaid > 0) {
        newStatus = SaleStatus.PARTIAL;
      } else {
        newStatus = SaleStatus.UNPAID;
      }

      await tx.sale.update({
        where: { id: sale.id },
        data: {
          amountPaid: new Decimal(newPaid.toFixed(2)),
          status: newStatus,
        },
      });

      remainingPayment -= allocated;
    }

    // 4. Réduire la dette du client (minimum 0)
    const currentDebt = Number(client.debtTotal);
    const newDebt = Math.max(0, currentDebt - input.amount);

    const updatedClient = await tx.client.update({
      where: { id: input.clientId },
      data: {
        debtTotal: new Decimal(newDebt.toFixed(2)),
      },
    });

    return {
      payment,
      updatedClient,
    };
  });
}

/**
 * Créer un client
 */
export async function createClient(input: CreateClientInput) {
  return await prisma.client.create({
    data: {
      name: input.name,
      phone: input.phone,
      address: input.address,
      email: input.email,
    },
  });
}

/**
 * Lister tous les clients (simple, pour selects)
 */
export async function listClients(includeInactive = false) {
  return await prisma.client.findMany({
    where: includeInactive ? {} : { isActive: true },
    orderBy: { name: 'asc' },
  });
}

export interface ListClientsPaginatedParams {
  page?: number;
  perPage?: number;
  search?: string;
  debtOnly?: boolean;
}

/**
 * Lister les clients paginé avec filtres
 */
export async function listClientsPaginated(params: ListClientsPaginatedParams = {}) {
  const { page = 1, perPage = 20, search, debtOnly = false } = params;
  const skip = (page - 1) * perPage;

  const where: Record<string, unknown> = { isActive: true };

  if (debtOnly) {
    where.debtTotal = { gt: 0 };
  }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { phone: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [data, total] = await Promise.all([
    prisma.client.findMany({
      where,
      take: perPage,
      skip,
      orderBy: debtOnly ? { debtTotal: 'desc' } : { name: 'asc' },
      include: {
        payments: {
          select: { id: true, amount: true, method: true, paymentDate: true },
          orderBy: { paymentDate: 'desc' },
          take: 1,
        },
        _count: { select: { sales: true } },
      },
    }),
    prisma.client.count({ where }),
  ]);

  return {
    data: data.map((c) => ({
      ...c,
      debtTotal: c.debtTotal.toString(),
      lastPayment: c.payments[0] ?? null,
      salesCount: c._count.sales,
    })),
    total,
    page,
    perPage,
    totalPages: Math.ceil(total / perPage),
  };
}

/**
 * Récupérer un client avec ses ventes et paiements
 */
export async function getClientById(
  id: string
): Promise<ClientWithDetails | null> {
  return await prisma.client.findUnique({
    where: { id },
    include: {
      sales: {
        select: {
          id: true,
          saleNumber: true,
          totalAmount: true,
          amountPaid: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 20,
      },
      payments: {
        select: {
          id: true,
          amount: true,
          paymentDate: true,
        },
        orderBy: { paymentDate: 'desc' },
        take: 20,
      },
    },
  });
}

/**
 * Récupérer un client avec détail complet (paiements + ventes)
 */
export async function getClientDetail(id: string) {
  const client = await prisma.client.findUnique({
    where: { id },
    include: {
      payments: {
        select: {
          id: true,
          amount: true,
          method: true,
          reference: true,
          notes: true,
          paymentDate: true,
          createdBy: { select: { name: true, email: true } },
        },
        orderBy: { paymentDate: 'desc' },
      },
      sales: {
        select: {
          id: true,
          saleNumber: true,
          status: true,
          totalAmount: true,
          amountPaid: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 50,
      },
    },
  });

  if (!client) return null;

  return {
    ...client,
    debtTotal: client.debtTotal.toString(),
    payments: client.payments.map((p) => ({
      ...p,
      amount: p.amount.toString(),
    })),
    sales: client.sales.map((s) => ({
      ...s,
      totalAmount: s.totalAmount.toString(),
      amountPaid: s.amountPaid.toString(),
    })),
  };
}

/**
 * Mettre à jour un client
 */
export async function updateClient(
  id: string,
  input: { name?: string; phone?: string; email?: string; address?: string }
) {
  return prisma.client.update({ where: { id }, data: input });
}

/**
 * Désactiver un client
 */
export async function deactivateClient(id: string) {
  return await prisma.client.update({
    where: { id },
    data: { isActive: false },
  });
}

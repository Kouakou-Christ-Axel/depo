import prisma from '@/lib/prisma';
import { CreateExpenseInput } from './schemas/expense.schema';
import { Decimal } from '@prisma/client/runtime/client';

export interface ListExpensesParams {
  page?: number;
  perPage?: number;
  search?: string;
  category?: string;
}

/**
 * Créer une dépense
 */
export async function createExpense(
  input: CreateExpenseInput,
  createdById: string
) {
  return prisma.expense.create({
    data: {
      category: input.category,
      description: input.description,
      amount: new Decimal(input.amount.toFixed(2)),
      expenseDate: input.expenseDate ? new Date(input.expenseDate) : new Date(),
      createdById,
    },
  });
}

/**
 * Lister les dépenses (paginé)
 */
export async function listExpenses(params: ListExpensesParams = {}) {
  const { page = 1, perPage = 20, search, category } = params;
  const skip = (page - 1) * perPage;

  const where: Record<string, unknown> = {};
  if (category) where.category = category;
  if (search) {
    where.OR = [
      { description: { contains: search, mode: 'insensitive' } },
      { category: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [data, total] = await Promise.all([
    prisma.expense.findMany({
      where,
      take: perPage,
      skip,
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
      },
      orderBy: { expenseDate: 'desc' },
    }),
    prisma.expense.count({ where }),
  ]);

  return {
    data: data.map((e) => ({
      id: e.id,
      category: e.category,
      description: e.description,
      amount: e.amount.toString(),
      expenseDate: e.expenseDate.toISOString(),
      createdByName: e.createdBy.name || e.createdBy.email,
    })),
    total,
    page,
    perPage,
    totalPages: Math.ceil(total / perPage),
  };
}

/**
 * Statistiques des dépenses
 */
export async function getExpenseStats() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const [thisMonth, byCategory, totalAll] = await Promise.all([
    prisma.expense.aggregate({
      where: { expenseDate: { gte: startOfMonth, lte: endOfMonth } },
      _sum: { amount: true },
      _count: true,
    }),
    prisma.expense.groupBy({
      by: ['category'],
      where: { expenseDate: { gte: startOfMonth, lte: endOfMonth } },
      _sum: { amount: true },
      _count: true,
      orderBy: { _sum: { amount: 'desc' } },
    }),
    prisma.expense.aggregate({
      _sum: { amount: true },
      _count: true,
    }),
  ]);

  return {
    thisMonth: {
      total: Number(thisMonth._sum.amount ?? 0),
      count: thisMonth._count,
    },
    allTime: {
      total: Number(totalAll._sum.amount ?? 0),
      count: totalAll._count,
    },
    byCategory: byCategory.map((c) => ({
      category: c.category,
      total: Number(c._sum.amount ?? 0),
      count: c._count,
    })),
  };
}

import prisma from '@/lib/prisma';
import { SaleStatus } from '@/generated/prisma/enums';

/**
 * Rapport analytique complet pour une période donnée
 */
export async function getAnalytics(startDate: Date, endDate: Date) {
  const [
    sales,
    expenses,
    payments,
    stockReport,
    debtClients,
    topProducts,
    topClients,
  ] = await Promise.all([
    // Ventes sur la période
    prisma.sale.findMany({
      where: {
        createdAt: { gte: startDate, lte: endDate },
        status: { not: SaleStatus.CANCELLED },
      },
      include: {
        items: {
          include: {
            productVariant: {
              include: { product: true, variant: true },
            },
          },
        },
        client: { select: { id: true, name: true } },
      },
    }),

    // Dépenses sur la période
    prisma.expense.findMany({
      where: { expenseDate: { gte: startDate, lte: endDate } },
    }),

    // Paiements (recouvrements) sur la période
    prisma.clientPayment.findMany({
      where: { paymentDate: { gte: startDate, lte: endDate } },
    }),

    // Valeur stock actuel
    prisma.productVariant.findMany({
      where: { isActive: true, product: { isActive: true } },
      include: { product: true },
    }),

    // Clients endettés (argent dehors)
    prisma.client.findMany({
      where: { isActive: true, debtTotal: { gt: 0 } },
      include: {
        sales: {
          where: { status: { in: [SaleStatus.UNPAID, SaleStatus.PARTIAL] } },
          select: { createdAt: true, totalAmount: true, amountPaid: true },
        },
        payments: {
          select: { paymentDate: true, amount: true },
          orderBy: { paymentDate: 'desc' },
        },
      },
      orderBy: { debtTotal: 'desc' },
    }),

    // Top produits vendus
    prisma.saleItem.groupBy({
      by: ['productVariantId'],
      where: {
        sale: {
          createdAt: { gte: startDate, lte: endDate },
          status: { not: SaleStatus.CANCELLED },
        },
      },
      _sum: { quantityHalf: true, subtotal: true },
      _count: true,
      orderBy: { _sum: { subtotal: 'desc' } },
      take: 10,
    }),

    // Top clients acheteurs
    prisma.sale.groupBy({
      by: ['clientId'],
      where: {
        createdAt: { gte: startDate, lte: endDate },
        status: { not: SaleStatus.CANCELLED },
        clientId: { not: null },
      },
      _sum: { totalAmount: true },
      _count: true,
      orderBy: { _sum: { totalAmount: 'desc' } },
      take: 10,
    }),
  ]);

  // --- Calculs ---

  // CA et encaissements
  const totalCA = sales.reduce((s, sale) => s + Number(sale.totalAmount), 0);
  const totalPaid = sales.reduce((s, sale) => s + Number(sale.amountPaid), 0);
  const totalRecovery = payments.reduce((s, p) => s + Number(p.amount), 0);
  const totalEncaissements = totalPaid + totalRecovery;
  const salesCount = sales.length;
  const avgBasket = salesCount > 0 ? totalCA / salesCount : 0;

  // Coût des marchandises vendues (COGS)
  let totalCOGS = 0;
  for (const sale of sales) {
    for (const item of sale.items) {
      const costPerHalf = Number(item.productVariant.averageCostCasier) / 2;
      totalCOGS += costPerHalf * item.quantityHalf;
    }
  }

  // Dépenses
  const totalExpenses = expenses.reduce((s, e) => s + Number(e.amount), 0);
  const expensesByCategory: Record<string, number> = {};
  for (const e of expenses) {
    expensesByCategory[e.category] = (expensesByCategory[e.category] || 0) + Number(e.amount);
  }

  // Bénéfice
  const grossProfit = totalCA - totalCOGS;
  const netProfit = grossProfit - totalExpenses;
  const grossMarginPct = totalCA > 0 ? (grossProfit / totalCA) * 100 : 0;
  const recoveryRate = totalCA > 0 ? (totalEncaissements / totalCA) * 100 : 0;

  // Argent dehors
  const totalDebt = debtClients.reduce((s, c) => s + Number(c.debtTotal), 0);

  // Délai moyen de recouvrement (jours entre vente et dernier paiement)
  let totalDays = 0;
  let recoveredCount = 0;
  for (const client of debtClients) {
    for (const sale of client.sales) {
      const saleDate = new Date(sale.createdAt);
      // Trouver le paiement le plus proche après la vente
      const paymentAfter = client.payments.find(
        (p) => new Date(p.paymentDate) >= saleDate
      );
      if (paymentAfter) {
        const days = Math.floor(
          (new Date(paymentAfter.paymentDate).getTime() - saleDate.getTime()) /
            (1000 * 60 * 60 * 24)
        );
        totalDays += days;
        recoveredCount++;
      }
    }
  }
  const avgRecoveryDays = recoveredCount > 0 ? Math.round(totalDays / recoveredCount) : 0;

  // Stock valeur
  const stockValue = stockReport.reduce(
    (s, pv) => s + (pv.stockHalf / 2) * Number(pv.averageCostCasier),
    0
  );

  // Rotation stock (COGS / Valeur stock)
  const stockRotation = stockValue > 0 ? totalCOGS / stockValue : 0;

  // Evolution CA par jour
  const salesByDay: Record<string, { ca: number; expenses: number }> = {};
  for (const sale of sales) {
    const day = sale.createdAt.toISOString().slice(0, 10);
    if (!salesByDay[day]) salesByDay[day] = { ca: 0, expenses: 0 };
    salesByDay[day].ca += Number(sale.totalAmount);
  }
  for (const expense of expenses) {
    const day = expense.expenseDate.toISOString().slice(0, 10);
    if (!salesByDay[day]) salesByDay[day] = { ca: 0, expenses: 0 };
    salesByDay[day].expenses += Number(expense.amount);
  }

  const chartData = Object.entries(salesByDay)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, data]) => ({
      date,
      ca: Math.round(data.ca),
      depenses: Math.round(data.expenses),
    }));

  // Top produits — enrich with names
  const topProductVariantIds = topProducts.map((tp) => tp.productVariantId);
  const productVariantDetails = await prisma.productVariant.findMany({
    where: { id: { in: topProductVariantIds } },
    include: { product: true, variant: true },
  });
  const pvMap = new Map(productVariantDetails.map((pv) => [pv.id, pv]));

  const topProductsData = topProducts.map((tp) => {
    const pv = pvMap.get(tp.productVariantId);
    return {
      name: pv ? `${pv.product.name} ${pv.variant.name}` : 'Inconnu',
      quantityCasier: (tp._sum.quantityHalf ?? 0) / 2,
      ca: Number(tp._sum.subtotal ?? 0),
      pctCA: totalCA > 0 ? (Number(tp._sum.subtotal ?? 0) / totalCA) * 100 : 0,
    };
  });

  // Top clients — enrich with names
  const clientIds = topClients
    .map((tc) => tc.clientId)
    .filter((id): id is string => id !== null);
  const clientDetails = await prisma.client.findMany({
    where: { id: { in: clientIds } },
    select: { id: true, name: true, debtTotal: true },
  });
  const clientMap = new Map(clientDetails.map((c) => [c.id, c]));

  const topClientsData = topClients.map((tc) => {
    const client = clientMap.get(tc.clientId ?? '');
    return {
      name: client?.name ?? 'Inconnu',
      salesCount: tc._count,
      totalBought: Number(tc._sum.totalAmount ?? 0),
      debt: Number(client?.debtTotal ?? 0),
    };
  });

  // Dépenses par catégorie
  const expenseCategoryData = Object.entries(expensesByCategory)
    .sort(([, a], [, b]) => b - a)
    .map(([cat, total]) => ({
      category: cat,
      total: Math.round(total),
      pct: totalExpenses > 0 ? (total / totalExpenses) * 100 : 0,
    }));

  return {
    overview: {
      totalCA: Math.round(totalCA),
      totalEncaissements: Math.round(totalEncaissements),
      totalExpenses: Math.round(totalExpenses),
      totalCOGS: Math.round(totalCOGS),
      grossProfit: Math.round(grossProfit),
      netProfit: Math.round(netProfit),
      grossMarginPct: Math.round(grossMarginPct * 10) / 10,
      recoveryRate: Math.round(recoveryRate * 10) / 10,
      avgBasket: Math.round(avgBasket),
      salesCount,
      stockRotation: Math.round(stockRotation * 100) / 100,
    },
    debt: {
      totalDebt: Math.round(totalDebt),
      clientsWithDebt: debtClients.length,
      avgRecoveryDays,
    },
    chartData,
    expensesByCategory: expenseCategoryData,
    topProducts: topProductsData,
    topClients: topClientsData,
  };
}

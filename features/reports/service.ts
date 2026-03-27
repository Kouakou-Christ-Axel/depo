import prisma from '@/lib/prisma';
import { SaleStatus } from '@/generated/prisma';

/**
 * Rapport de ventes par période
 */
export async function getSalesReport(startDate: Date, endDate: Date) {
  const sales = await prisma.sale.findMany({
    where: {
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
      status: {
        not: SaleStatus.CANCELLED,
      },
    },
    include: {
      items: {
        include: {
          productVariant: {
            include: {
              product: true,
              variant: true,
            },
          },
        },
      },
    },
  });

  const totalSales = sales.reduce(
    (sum, sale) => sum + Number(sale.totalAmount),
    0
  );
  const totalPaid = sales.reduce(
    (sum, sale) => sum + Number(sale.amountPaid),
    0
  );
  const totalUnpaid = totalSales - totalPaid;

  return {
    sales,
    summary: {
      totalSales,
      totalPaid,
      totalUnpaid,
      salesCount: sales.length,
    },
  };
}

/**
 * Rapport de stock actuel
 */
export async function getStockReport() {
  const productVariants = await prisma.productVariant.findMany({
    where: {
      isActive: true,
      product: {
        isActive: true,
      },
    },
    include: {
      product: true,
      variant: true,
    },
    orderBy: [{ product: { name: 'asc' } }, { variant: { sizeInMl: 'asc' } }],
  });

  const totalValue = productVariants.reduce((sum, pv) => {
    const stockCasier = pv.stockHalf / 2;
    const value = stockCasier * Number(pv.averageCostCasier);
    return sum + value;
  }, 0);

  const lowStockItems = productVariants.filter(
    (pv) => pv.stockHalf <= pv.alertThresholdHalf
  );

  return {
    productVariants: productVariants.map((pv) => ({
      ...pv,
      stockCasier: pv.stockHalf / 2,
      stockValue: (pv.stockHalf / 2) * Number(pv.averageCostCasier),
    })),
    summary: {
      totalProducts: productVariants.length,
      totalValue,
      lowStockCount: lowStockItems.length,
    },
  };
}

/**
 * Rapport des clients avec dettes
 */
export async function getClientsDebtReport() {
  const clients = await prisma.client.findMany({
    where: {
      isActive: true,
      debtTotal: {
        gt: 0,
      },
    },
    orderBy: {
      debtTotal: 'desc',
    },
    include: {
      sales: {
        where: {
          status: {
            in: [SaleStatus.UNPAID, SaleStatus.PARTIAL],
          },
        },
        select: {
          id: true,
          saleNumber: true,
          totalAmount: true,
          amountPaid: true,
          createdAt: true,
        },
      },
    },
  });

  const totalDebt = clients.reduce(
    (sum, client) => sum + Number(client.debtTotal),
    0
  );

  return {
    clients,
    summary: {
      totalDebt,
      clientsWithDebt: clients.length,
    },
  };
}

/**
 * Tableau de bord
 */
export async function getDashboard() {
  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  const [salesThisMonth, stockReport, debtReport] = await Promise.all([
    getSalesReport(startOfMonth, endOfMonth),
    getStockReport(),
    getClientsDebtReport(),
  ]);

  return {
    salesThisMonth: salesThisMonth.summary,
    stock: stockReport.summary,
    debts: debtReport.summary,
  };
}

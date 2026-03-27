/**
 * Export centralisé de tous les services
 * Facilite l'import dans les Server Components
 */

// Products
export {
  createVariant,
  listVariants,
  createProduct,
  listProducts,
  getProductById,
  listProductVariants,
  getProductVariantById,
  updateProductVariantPrice,
  deactivateProduct,
  getProductsLowStock,
} from './products/service';

// Purchases
export {
  createPurchase,
  listPurchases,
  getPurchaseById,
} from './purchases/service';

// Sales
export {
  createSale,
  listSales,
  getSaleById,
  getSaleBySaleNumber,
} from './sales/service';

// Clients
export {
  createClient,
  recordClientPayment,
  listClients,
  getClientById,
  deactivateClient,
} from './clients/service';

// Stock
export {
  createStockAdjustment,
  listStockMovements,
  getStockMovementById,
} from './stock/service';

// Reports
export {
  getSalesReport,
  getStockReport,
  getClientsDebtReport,
  getDashboard,
} from './reports/service';

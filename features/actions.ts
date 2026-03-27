/**
 * Export centralisé de toutes les Server Actions
 * Facilite l'import dans les composants UI
 */

// Products
export {
  createVariantAction,
  createProductAction,
} from './products/actions/createProduct.action';

// Purchases
export { createPurchaseAction } from './purchases/actions/createPurchase.action';

// Sales
export { createSaleAction } from './sales/actions/createSale.action';

// Clients
export { recordClientPaymentAction } from './clients/actions/recordClientPayment.action';

// Stock
export { createStockAdjustmentAction } from './stock/actions/createStockAdjustment.action';

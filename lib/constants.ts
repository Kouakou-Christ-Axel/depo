/**
 * Constantes de l'application
 */

// Rôles utilisateurs
export const USER_ROLES = {
  ADMIN: 'ADMIN',
  SECRETAIRE: 'SECRETAIRE',
  GESTIONNAIRE_STOCK: 'GESTIONNAIRE_STOCK',
  VENDEUR: 'VENDEUR',
} as const;

// Statuts de vente
export const SALE_STATUS = {
  PAID: 'PAID',
  UNPAID: 'UNPAID',
  PARTIAL: 'PARTIAL',
  CANCELLED: 'CANCELLED',
} as const;

// Types de mouvements de stock
export const STOCK_MOVEMENT_TYPE = {
  IN: 'IN',
  OUT: 'OUT',
  LOSS: 'LOSS',
  ADJUSTMENT: 'ADJUSTMENT',
} as const;

// Tailles de casier standard
export const CASIER_SIZES = [12, 24] as const;

// Conversion casier <-> demi-casier
export const HALF_CASIER_PER_CASIER = 2;

// Méthodes de paiement
export const PAYMENT_METHODS = [
  'Espèces',
  'Mobile Money',
  'Virement',
  'Chèque',
] as const;

// Catégories de dépenses
export const EXPENSE_CATEGORIES = [
  'Transport',
  'Salaire',
  'Électricité',
  'Eau',
  'Loyer',
  'Maintenance',
  'Fournitures',
  'Autre',
] as const;

// Configuration pagination
export const PAGINATION = {
  DEFAULT_LIMIT: 50,
  MAX_LIMIT: 100,
} as const;

// Configuration stock
export const STOCK_CONFIG = {
  DEFAULT_ALERT_THRESHOLD_HALF: 10,
  LOW_STOCK_MULTIPLIER: 1.5, // Considéré en stock bas si < seuil * 1.5
} as const;

// Format de numéro de vente
export const SALE_NUMBER_PREFIX = 'VT';
export const SALE_NUMBER_FORMAT = 'VT-YYYY-NNNN';

// Devise
export const CURRENCY = 'FCFA';
export const CURRENCY_SYMBOL = 'FCFA';

// Formats de date
export const DATE_FORMATS = {
  SHORT: 'dd/MM/yyyy',
  LONG: 'dd MMMM yyyy',
  WITH_TIME: 'dd/MM/yyyy HH:mm',
} as const;

/**
 * === MATRICE DE PERMISSIONS ===
 *
 * C'est LE SEUL fichier à modifier pour changer les accès d'un rôle.
 *
 * Sujets : les ressources de l'application
 * Actions : ce qu'on peut faire sur chaque ressource
 */

import {
  AbilityBuilder,
  createMongoAbility,
  type MongoAbility,
} from "@casl/ability";

// --- Actions possibles ---
export type Action = "view" | "create" | "edit" | "delete" | "print";

// --- Sujets (ressources) ---
export type Subject =
  | "Dashboard"
  | "Product"
  | "Supplier"
  | "Purchase"
  | "Sale"
  | "Client"
  | "Stock"
  | "Expense"
  | "Report"
  | "User"
  | "all";

export type AppAbility = MongoAbility<[Action, Subject]>;

/**
 * Définit les permissions pour un rôle donné.
 * MODIFIER ICI pour changer les accès.
 */
export function defineAbilitiesFor(role: string | null): AppAbility {
  const { can, build } = new AbilityBuilder<AppAbility>(createMongoAbility);

  switch (role) {
    case "ADMIN":
      // Accès total
      can("view", "all");
      can("create", "all");
      can("edit", "all");
      can("delete", "all");
      can("print", "all");
      break;

    case "SECRETAIRE":
      // Ventes, clients, paiements, dépenses, rapports
      can("view", "Dashboard");
      can("view", "Sale");
      can("create", "Sale");
      can("print", "Sale");
      can("view", "Client");
      can("create", "Client");
      can("edit", "Client");
      can("view", "Product");
      can("view", "Expense");
      can("create", "Expense");
      // can("view", "Report");
      can("view", "Supplier");
      break;

    case "GESTIONNAIRE_STOCK":
      // Produits, fournisseurs, achats, stock
      can("view", "Dashboard");
      can("view", "Product");
      can("create", "Product");
      can("edit", "Product");
      can("view", "Supplier");
      can("create", "Supplier");
      can("edit", "Supplier");
      can("view", "Purchase");
      can("create", "Purchase");
      can("view", "Stock");
      can("create", "Stock");
      // can("view", "Report");
      break;

    case "VENDEUR":
      // Ventes uniquement + consultation produits/clients
      can("view", "Dashboard");
      can("view", "Product");
      can("view", "Sale");
      can("create", "Sale");
      can("print", "Sale");
      can("view", "Client");
      can("create", "Client");
      break;

    default:
      // Pas de rôle = aucun accès
      break;
  }

  return build();
}

/**
 * Mapping navigation sidebar → sujet CASL
 * Utilisé pour filtrer les liens de la sidebar
 */
export const NAV_SUBJECT_MAP: Record<string, Subject> = {
  "/dashboard": "Dashboard",
  "/products": "Product",
  "/suppliers": "Supplier",
  "/purchases": "Purchase",
  "/sales": "Sale",
  "/clients": "Client",
  "/stock": "Stock",
  "/expenses": "Expense",
  "/reports": "Report",
  "/users": "User",
};

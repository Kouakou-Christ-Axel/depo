# Architecture - Gestion de Dépôt de Boissons

## Stack Technique

- **Next.js 14** (App Router)
- **Prisma** avec PostgreSQL
- **Better Auth** (email + password)
- **Zod** (validation)
- **TypeScript**

## Architecture Feature-Based

L'application suit une architecture feature-based où chaque module métier est une tranche verticale complète.

### Structure d'un Feature

```
/features/[module]/
  actions/        → Server Actions (mutations uniquement)
  components/     → UI spécifique au module
  schemas/        → Schémas Zod + validation
  types.ts        → Types TypeScript du module
  service.ts      → Logique métier + accès Prisma
```

### Règles Architecture

1. **GET (lecture)** : Appel direct au `service.ts` depuis les Server Components
2. **POST/PUT/DELETE (mutations)** : Server Actions → `service.ts`
3. **Validation** : Toujours avec Zod dans `schemas/`
4. **Logique métier** : Uniquement dans `service.ts`
5. **Prisma** : Uniquement dans `service.ts`, jamais dans les composants UI

## Modules Métier

### `/features/products`

Gestion des produits et variantes.

**Services :**

- `createVariant()` - Créer une variante globale (33cl, 66cl, etc.)
- `createProduct()` - Créer un produit avec ses variantes
- `listProducts()` - Lister les produits
- `listProductVariants()` - Lister les variantes pour le stock
- `getProductsLowStock()` - Produits en rupture de stock

**Actions :**

- `createVariantAction` - Permission: ADMIN
- `createProductAction` - Permission: ADMIN

### `/features/purchases`

Gestion des achats fournisseurs.

**Service principal :** `createPurchase()`

**Logique :**

1. Convertir quantityCasier en demi-casiers (× 2)
2. Calculer le coût moyen pondéré :
   ```
   nouveauCoût = (ancienStock × ancienCoût + nouvelleQty × nouveauPrix) / (ancienStock + nouvelleQty)
   ```
3. Mettre à jour `stockHalf` et `averageCostCasier`
4. Créer un `StockMovement` de type `IN`

**Actions :**

- `createPurchaseAction` - Permission: ADMIN, GESTIONNAIRE_STOCK

### `/features/sales`

Gestion des ventes.

**Service principal :** `createSale()`

**Logique :**

1. Vérifier le stock disponible pour chaque item
2. Calculer le total (prix unitaire = sellingPriceCasier / 2)
3. Générer un numéro de vente unique (VT-YYYY-NNNN)
4. Décrémenter le stock
5. Créer les mouvements de stock (type `OUT`)
6. Mettre à jour la dette client si statut UNPAID/PARTIAL

**Actions :**

- `createSaleAction` - Permission: ADMIN, SECRETAIRE, VENDEUR

### `/features/clients`

Gestion des clients et paiements.

**Services :**

- `createClient()` - Créer un client
- `recordClientPayment()` - Enregistrer un paiement
  - Réduit `debtTotal` du client (min 0)
- `getClientById()` - Détails client avec historique

**Actions :**

- `recordClientPaymentAction` - Permission: ADMIN, SECRETAIRE

### `/features/stock`

Ajustements manuels de stock.

**Service :** `createStockAdjustment()`

Utilisé pour :

- Pertes (LOSS)
- Casses
- Ajustements manuels (ADJUSTMENT)

**Actions :**

- `createStockAdjustmentAction` - Permission: ADMIN, GESTIONNAIRE_STOCK

### `/features/reports`

Rapports et statistiques.

**Services :**

- `getSalesReport()` - Ventes par période
- `getStockReport()` - État du stock
- `getClientsDebtReport()` - Clients avec dettes
- `getDashboard()` - Vue d'ensemble

## Sécurité (RBAC)

### Rôles

- **ADMIN** : Accès complet
- **SECRETAIRE** : Ventes + clients + paiements
- **GESTIONNAIRE_STOCK** : Achats + stock
- **VENDEUR** : Ventes uniquement

### Helpers (`/lib/auth-helpers.ts`)

```typescript
requireAuth(); // Utilisateur authentifié
requireRole(role); // Rôle spécifique
requireAnyRole([roles]); // Un des rôles
```

## Modèle de Données

### Concepts Clés

1. **Stock en demi-casiers** : Unité interne
   - 1 casier = 2 demi-casiers
   - Stocké dans `ProductVariant.stockHalf`

2. **Coût moyen pondéré** : `averageCostCasier`
   - Recalculé à chaque achat
   - Utilisé pour la rentabilité

3. **Prix de vente** : `sellingPriceCasier`
   - Stocké par casier
   - Prix demi-casier = prix casier / 2

4. **Traçabilité** : Tous les mouvements sont tracés
   - `createdAt` + `createdById` sur tous les modèles
   - `StockMovement` pour l'historique du stock

### Relations Principales

```
Product → ProductVariant ← Variant
ProductVariant → Purchase (achats)
ProductVariant → SaleItem (ventes)
ProductVariant → StockMovement (mouvements)
Client → Sale (ventes)
Client → ClientPayment (paiements)
```

## Exemples d'Utilisation

### Dans un Server Component (GET)

```typescript
import { listProducts } from "@/features/products/service";

export default async function ProductsPage() {
  const products = await listProducts();

  return (
    <div>
      {products.map(product => (
        <div key={product.id}>{product.name}</div>
      ))}
    </div>
  );
}
```

### Dans un Client Component (mutation)

```typescript
"use client";

import { createSaleAction } from "@/features/sales/actions/createSale.action";

export function SaleForm() {
  async function handleSubmit(data) {
    const result = await createSaleAction({
      items: [
        { productVariantId: "...", quantityHalf: 2 }
      ],
      amountPaid: 5000,
    });

    if (result.success) {
      // Succès
    }
  }

  return <form onSubmit={handleSubmit}>...</form>;
}
```

## Installation & Migration

```bash
# Installer les dépendances
pnpm install

# Générer le client Prisma
pnpm prisma generate

# Créer la migration
pnpm prisma migrate dev --name init

# Seed (optionnel)
pnpm prisma db seed
```

## Variables d'Environnement

```env
DATABASE_URL="postgresql://user:password@localhost:5432/depot"
BETTER_AUTH_SECRET="your-secret-key"
BETTER_AUTH_URL="http://localhost:3000"
```

## Bonnes Pratiques

1. ✅ **Toujours valider** avec Zod avant d'appeler le service
2. ✅ **Utiliser les transactions** pour les opérations multi-étapes
3. ✅ **Tracer tous les mouvements** (createdBy, createdAt)
4. ✅ **Gérer les erreurs** de façon explicite
5. ✅ **Types stricts** partout
6. ❌ **Jamais de Prisma** dans les composants UI
7. ❌ **Jamais de logique métier** dans les Server Actions

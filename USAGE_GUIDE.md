# 🚀 Guide d'Utilisation - Actions & Services

## Import Centralisé

Tous les services et actions sont exportés depuis deux fichiers centraux pour faciliter leur utilisation.

---

## 📥 Services (Server Components)

### Import

```typescript
import { listProducts, getProductById } from '@/features/services';
```

ou

```typescript
import { listProducts } from '@/features/products/service';
```

### Utilisation dans un Server Component

```typescript
// app/(dashboard)/products/page.tsx
import { listProducts } from "@/features/services";

export default async function ProductsPage() {
  // Appel direct au service côté serveur
  const products = await listProducts();

  return (
    <div>
      <h1>Produits</h1>
      {products.map((product) => (
        <div key={product.id}>
          <h2>{product.name}</h2>
          <p>{product.description}</p>
        </div>
      ))}
    </div>
  );
}
```

### Services Disponibles

#### Products

- `createVariant(input)` - Créer une variante
- `listVariants()` - Lister les variantes
- `createProduct(input)` - Créer un produit
- `listProducts(includeInactive?)` - Lister les produits
- `getProductById(id)` - Détail produit
- `listProductVariants(includeInactive?)` - Lister variantes produits
- `getProductVariantById(id)` - Détail variante produit
- `updateProductVariantPrice(id, price)` - Mettre à jour le prix
- `deactivateProduct(id)` - Désactiver un produit
- `getProductsLowStock()` - Produits en rupture

#### Purchases

- `createPurchase(input, userId)` - Créer un achat
- `listPurchases(limit?, offset?)` - Lister les achats
- `getPurchaseById(id)` - Détail achat

#### Sales

- `createSale(input, userId)` - Créer une vente
- `listSales(limit?, offset?, filters?)` - Lister les ventes
- `getSaleById(id)` - Détail vente
- `getSaleBySaleNumber(saleNumber)` - Recherche par numéro

#### Clients

- `createClient(input)` - Créer un client
- `recordClientPayment(input, userId)` - Enregistrer paiement
- `listClients(includeInactive?)` - Lister les clients
- `getClientById(id)` - Détail client
- `deactivateClient(id)` - Désactiver un client

#### Stock

- `createStockAdjustment(input, userId)` - Ajustement manuel
- `listStockMovements(limit?, offset?, filters?)` - Lister mouvements
- `getStockMovementById(id)` - Détail mouvement

#### Reports

- `getSalesReport(startDate, endDate)` - Rapport ventes
- `getStockReport()` - Rapport stock
- `getClientsDebtReport()` - Rapport dettes
- `getDashboard()` - Tableau de bord

---

## ⚡ Actions (Client Components)

### Import

```typescript
import { createSaleAction } from '@/features/actions';
```

ou

```typescript
import { createSaleAction } from '@/features/sales/actions/createSale.action';
```

### Utilisation dans un Client Component

```typescript
"use client";

import { createSaleAction } from "@/features/actions";
import { useState } from "react";

export function CreateSaleForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(data) {
    setIsLoading(true);
    setError("");

    const result = await createSaleAction({
      items: [
        { productVariantId: "...", quantityHalf: 2 }
      ],
      amountPaid: 5000,
    });

    if (result.success) {
      // Succès
      console.log("Vente créée:", result.data);
    } else {
      // Erreur
      setError(result.error);
    }

    setIsLoading(false);
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* Formulaire */}
    </form>
  );
}
```

### Actions Disponibles

#### Products

- `createVariantAction(input)` - ADMIN
- `createProductAction(input)` - ADMIN

#### Purchases

- `createPurchaseAction(input)` - ADMIN, GESTIONNAIRE_STOCK

#### Sales

- `createSaleAction(input)` - ADMIN, SECRETAIRE, VENDEUR

#### Clients

- `recordClientPaymentAction(input)` - ADMIN, SECRETAIRE

#### Stock

- `createStockAdjustmentAction(input)` - ADMIN, GESTIONNAIRE_STOCK

---

## 📋 Format de Réponse des Actions

Toutes les Server Actions retournent le même format :

```typescript
// Succès
{
  success: true,
  data: { /* résultat */ }
}

// Erreur
{
  success: false,
  error: "Message d'erreur"
}
```

### Exemple de Gestion

```typescript
const result = await createSaleAction(input);

if (result.success) {
  // Accéder aux données
  const sale = result.data.sale;
  console.log('Vente créée:', sale.saleNumber);

  // Rediriger ou rafraîchir
  router.push('/sales');
  router.refresh();
} else {
  // Afficher l'erreur
  setError(result.error);
}
```

---

## 🔐 Permissions

Les Server Actions vérifient automatiquement les permissions. Pas besoin de vérifier manuellement.

```typescript
// L'action vérifie automatiquement si l'utilisateur a le bon rôle
const result = await createPurchaseAction(input);

if (result.success) {
  // L'utilisateur a les permissions
} else if (result.error.includes('Accès refusé')) {
  // L'utilisateur n'a pas les permissions
}
```

---

## 🎯 Bonnes Pratiques

### 1. Utiliser les Services dans Server Components

✅ **BON**

```typescript
// Server Component
export default async function ProductsPage() {
  const products = await listProducts();
  return <ProductList products={products} />;
}
```

❌ **MAUVAIS**

```typescript
// Ne pas appeler Prisma directement
import prisma from '@/lib/prisma';
export default async function ProductsPage() {
  const products = await prisma.product.findMany(); // ❌
}
```

### 2. Utiliser les Actions dans Client Components

✅ **BON**

```typescript
'use client';
export function CreateProductForm() {
  const handleSubmit = async (data) => {
    const result = await createProductAction(data);
  };
}
```

❌ **MAUVAIS**

```typescript
// Ne pas appeler les services directement depuis le client
'use client';
export function CreateProductForm() {
  const handleSubmit = async (data) => {
    const result = await createProduct(data); // ❌
  };
}
```

### 3. Valider avant d'appeler les Actions

```typescript
// Les actions valident déjà avec Zod, mais vous pouvez ajouter
// une validation côté client pour une meilleure UX
import { createSaleSchema } from '@/features/sales/schemas/createSale.schema';

function handleSubmit(data) {
  // Validation côté client (optionnel)
  const validation = createSaleSchema.safeParse(data);

  if (!validation.success) {
    // Afficher les erreurs de validation
    setErrors(validation.error.errors);
    return;
  }

  // Appeler l'action
  const result = await createSaleAction(data);
}
```

### 4. Gérer le Loading et les Erreurs

```typescript
const [isLoading, setIsLoading] = useState(false);
const [error, setError] = useState('');

async function handleSubmit(data) {
  setIsLoading(true);
  setError('');

  try {
    const result = await createSaleAction(data);

    if (result.success) {
      // Succès
      router.push('/sales');
    } else {
      setError(result.error);
    }
  } catch (err) {
    setError("Une erreur inattendue s'est produite");
  } finally {
    setIsLoading(false);
  }
}
```

---

## 📚 Ressources

- [ARCHITECTURE.md](./ARCHITECTURE.md) - Architecture complète
- [QUICK_START.md](./QUICK_START.md) - Guide de démarrage
- [Next.js Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)
- [Next.js Server Components](https://nextjs.org/docs/app/building-your-application/rendering/server-components)

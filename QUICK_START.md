# 🍺 Gestion de Dépôt de Boissons - Guide de Démarrage Rapide

## 📦 Installation et Configuration

### 1. Installer les dépendances

```bash
pnpm install
```

### 2. Configurer la base de données

Créer un fichier `.env` :

```env
DATABASE_URL="postgresql://user:password@localhost:5432/depot"
BETTER_AUTH_SECRET="votre-secret-super-securise"
BETTER_AUTH_URL="http://localhost:3000"
```

### 3. Générer Prisma et migrer

```bash
pnpm db:generate
pnpm db:migrate
```

### 4. (Optionnel) Seed avec des données de test

```bash
pnpm db:seed
```

Identifiants de test :

- Email : `admin@depot.com`
- Mot de passe : `password123`

### 5. Démarrer l'application

```bash
pnpm dev
```

→ Ouvrir [http://localhost:3000](http://localhost:3000)

---

## 📚 Documentation Complète

- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Architecture détaillée de l'application
- **[prisma/schema.prisma](./prisma/schema.prisma)** - Modèle de données

---

## 🚀 Scripts Disponibles

```bash
pnpm dev              # Démarrer en développement
pnpm build            # Build pour production
pnpm db:generate      # Générer le client Prisma
pnpm db:migrate       # Créer/appliquer une migration
pnpm db:seed          # Seed la base de données
pnpm db:studio        # Ouvrir Prisma Studio
```

---

## 📋 Fonctionnalités Implémentées

✅ Gestion des produits et variantes (33cl, 66cl, 100cl)  
✅ Gestion du stock en demi-casiers  
✅ Achats fournisseurs avec coût moyen pondéré  
✅ Ventes avec gestion des dettes clients  
✅ Paiements clients  
✅ Mouvements de stock (traçabilité)  
✅ Rapports et tableau de bord  
✅ RBAC (4 rôles : ADMIN, SECRETAIRE, GESTIONNAIRE_STOCK, VENDEUR)  
✅ Authentification sécurisée

---

## 🎯 Prochaines Étapes

1. Consulter [ARCHITECTURE.md](./ARCHITECTURE.md) pour comprendre la structure
2. Explorer les features dans `/features`
3. Tester les Server Actions dans les pages d'exemple
4. Personnaliser l'UI selon vos besoins

Bon développement ! 🚀

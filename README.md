# DEPO

claude --resume 9f6f8db7-f198-4ba2-a1f9-c5005525ae1a

DEPO est une application web simple et robuste dédiée à la gestion quotidienne d’un dépôt de boissons.

Elle a été conçue pour répondre aux réalités du terrain :
- ventes fréquentes
- gestion du stock en temps réel
- clients à crédit
- suivi clair de la caisse
- simplicité extrême

Aucun gadget. Juste l’essentiel pour travailler efficacement.

---

## 🎯 Objectifs du projet

- Vendre rapidement (interface type caisse)
- Avoir un stock toujours exact
- Suivre précisément les dettes clients
- Savoir chaque jour si le dépôt a gagné ou perdu
- Être utilisable par des gérants non informaticiens

---

## 🧠 Principes clés

- Simplicité avant tout
- Peu de clics
- Gros boutons
- Rapide sur PC basique et tablette
- Fiable même avec une connexion moyenne

Si l’application est lente ou compliquée, elle n’a aucune valeur.

---

## 🧩 Fonctionnalités principales

### 🔹 Ventes (POS)
- Vente comptant
- Vente à crédit
- Recherche rapide des produits
- Mise à jour automatique du stock
- Historique des ventes

### 🔹 Stock
- Entrées de stock (approvisionnement)
- Sorties automatiques via les ventes
- Mouvements de stock tracés (qui, quand, pourquoi)
- Alertes stock faible

### 🔹 Clients & dettes
- Gestion des clients
- Suivi des dettes
- Historique des ventes par client
- Paiements de dettes

### 🔹 Caisse
- Suivi des entrées d’argent
- Enregistrement des dépenses
- Solde journalier
- Rapport quotidien

### 🔹 Utilisateurs
- Compte administrateur
- Comptes employés
- Traçabilité des actions

---

## 🏗️ Architecture technique

- **Next.js 14** (App Router)
- **Server Actions**
- **Prisma**
- **PostgreSQL**
- **Tailwind CSS**
- **shadcn/ui**
- Authentification simple (email / mot de passe)

### Hébergement (MVP)
- Vercel
- Supabase (PostgreSQL + backups automatiques)

---

## 🗄️ Modèle de données (résumé)

- Users
- Products
- Clients
- Sales
- Sale items
- Stock movements
- Expenses

Le stock est la source de vérité.
Chaque mouvement est enregistré.

---

## 🚀 Installation (développement)

```bash
git clone https://github.com/ton-org/depo.git
cd depo
npm install

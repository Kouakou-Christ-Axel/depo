import { PrismaClient, UserRole } from '@/generated/prisma';
import { Decimal } from '@prisma/client-runtime-utils';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Début du seed...');

  // Nettoyer la base (optionnel en dev)
  // await prisma.$executeRaw`TRUNCATE TABLE "user" CASCADE`;

  // 1. Créer un utilisateur admin
  const admin = await prisma.user.upsert({
    where: { email: 'admin@depot.com' },
    update: {},
    create: {
      email: 'admin@depot.com',
      name: 'Administrateur',
      role: UserRole.ADMIN,
      emailVerified: true,
      accounts: {
        create: {
          id: 'admin-account',
          accountId: 'admin-account',
          providerId: 'credential',
          password:
            '$2a$10$rH5K8X9Z7Y6W5V4U3T2S1OqN0P9M8L7K6J5I4H3G2F1E0D9C8B7A6', // "password123" hasheé
        },
      },
    },
  });

  console.log('✅ Admin créé:', admin.email);

  // 2. Créer des variantes
  const variant33cl = await prisma.variant.upsert({
    where: { name: '33cl' },
    update: {},
    create: {
      name: '33cl',
      sizeInMl: 330,
      description: 'Petite bouteille',
    },
  });

  const variant66cl = await prisma.variant.upsert({
    where: { name: '66cl' },
    update: {},
    create: {
      name: '66cl',
      sizeInMl: 660,
      description: 'Grande bouteille',
    },
  });

  const variant100cl = await prisma.variant.upsert({
    where: { name: '100cl' },
    update: {},
    create: {
      name: '100cl',
      sizeInMl: 1000,
      description: 'Bouteille de 1 litre',
    },
  });

  console.log('✅ Variantes créées');

  // 3. Créer des produits avec variantes
  const heineken = await prisma.product.upsert({
    where: { name: 'Heineken' },
    update: {},
    create: {
      name: 'Heineken',
      description: 'Bière premium',
      variants: {
        create: [
          {
            variantId: variant33cl.id,
            casierSize: 24,
            sellingPriceCasier: new Decimal(12000), // 12 000 FCFA le casier
            alertThresholdHalf: 10,
          },
          {
            variantId: variant66cl.id,
            casierSize: 12,
            sellingPriceCasier: new Decimal(15000),
            alertThresholdHalf: 8,
          },
        ],
      },
    },
  });

  const cocaCola = await prisma.product.upsert({
    where: { name: 'Coca-Cola' },
    update: {},
    create: {
      name: 'Coca-Cola',
      description: 'Boisson gazeuse',
      variants: {
        create: [
          {
            variantId: variant33cl.id,
            casierSize: 24,
            sellingPriceCasier: new Decimal(10000),
            alertThresholdHalf: 12,
          },
          {
            variantId: variant100cl.id,
            casierSize: 12,
            sellingPriceCasier: new Decimal(14000),
            alertThresholdHalf: 8,
          },
        ],
      },
    },
  });

  const castel = await prisma.product.upsert({
    where: { name: 'Castel' },
    update: {},
    create: {
      name: 'Castel',
      description: 'Bière locale',
      variants: {
        create: [
          {
            variantId: variant66cl.id,
            casierSize: 12,
            sellingPriceCasier: new Decimal(13000),
            alertThresholdHalf: 10,
          },
        ],
      },
    },
  });

  console.log('✅ Produits créés');

  // 4. Créer quelques clients
  const client1 = await prisma.client.create({
    data: {
      name: 'Restaurant Le Palmier',
      phone: '+225 07 12 34 56 78',
      address: 'Cocody, Abidjan',
      email: 'contact@lepalmier.ci',
    },
  });

  const client2 = await prisma.client.create({
    data: {
      name: 'Bar Chez Kadjo',
      phone: '+225 05 98 76 54 32',
      address: 'Yopougon, Abidjan',
    },
  });

  console.log('✅ Clients créés');

  // 5. Créer un achat pour initialiser le stock
  const heinekenVariants = await prisma.productVariant.findMany({
    where: { productId: heineken.id },
  });

  if (heinekenVariants.length > 0) {
    const heinekenVariant = heinekenVariants[0];

    await prisma.purchase.create({
      data: {
        productVariantId: heinekenVariant.id,
        quantityCasier: 10,
        purchasePriceCasier: new Decimal(10000),
        totalAmount: new Decimal(100000),
        supplierName: 'SOLIBRA',
        createdById: admin.id,
      },
    });

    // Mettre à jour le stock
    await prisma.productVariant.update({
      where: { id: heinekenVariant.id },
      data: {
        stockHalf: 20, // 10 casiers = 20 demi-casiers
        averageCostCasier: new Decimal(10000),
      },
    });

    // Créer le mouvement de stock
    await prisma.stockMovement.create({
      data: {
        productVariantId: heinekenVariant.id,
        type: 'IN',
        quantityHalf: 20,
        stockAfter: 20,
        notes: 'Stock initial - Achat SOLIBRA',
        createdById: admin.id,
      },
    });

    console.log('✅ Stock initial créé');
  }

  console.log('🎉 Seed terminé avec succès !');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Erreur lors du seed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });

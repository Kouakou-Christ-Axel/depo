import prisma from '@/lib/prisma';
import {
  RecordClientPaymentInput,
  CreateClientInput,
} from './schemas/recordClientPayment.schema';
import { RecordClientPaymentResult, ClientWithDetails } from './types';
import { Decimal } from '@prisma/client-runtime-utils';

/**
 * Enregistrer un paiement client
 * - Réduit la dette du client
 */
export async function recordClientPayment(
  input: RecordClientPaymentInput,
  createdById: string
): Promise<RecordClientPaymentResult> {
  return await prisma.$transaction(async (tx) => {
    // 1. Vérifier que le client existe
    const client = await tx.client.findUnique({
      where: { id: input.clientId },
    });

    if (!client) {
      throw new Error('Client introuvable');
    }

    if (!client.isActive) {
      throw new Error('Ce client est désactivé');
    }

    // 2. Créer le paiement
    const payment = await tx.clientPayment.create({
      data: {
        clientId: input.clientId,
        amount: new Decimal(input.amount),
        method: input.method,
        reference: input.reference,
        notes: input.notes,
        paymentDate: input.paymentDate || new Date(),
        createdById,
      },
    });

    // 3. Réduire la dette (minimum 0)
    const currentDebt = Number(client.debtTotal);
    const newDebt = Math.max(0, currentDebt - input.amount);

    const updatedClient = await tx.client.update({
      where: { id: input.clientId },
      data: {
        debtTotal: new Decimal(newDebt.toFixed(2)),
      },
    });

    return {
      payment,
      updatedClient,
    };
  });
}

/**
 * Créer un client
 */
export async function createClient(input: CreateClientInput) {
  return await prisma.client.create({
    data: {
      name: input.name,
      phone: input.phone,
      address: input.address,
      email: input.email,
    },
  });
}

/**
 * Lister tous les clients
 */
export async function listClients(includeInactive = false) {
  return await prisma.client.findMany({
    where: includeInactive ? {} : { isActive: true },
    orderBy: { name: 'asc' },
  });
}

/**
 * Récupérer un client avec ses ventes et paiements
 */
export async function getClientById(
  id: string
): Promise<ClientWithDetails | null> {
  return await prisma.client.findUnique({
    where: { id },
    include: {
      sales: {
        select: {
          id: true,
          saleNumber: true,
          totalAmount: true,
          amountPaid: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 20,
      },
      payments: {
        select: {
          id: true,
          amount: true,
          paymentDate: true,
        },
        orderBy: { paymentDate: 'desc' },
        take: 20,
      },
    },
  });
}

/**
 * Désactiver un client
 */
export async function deactivateClient(id: string) {
  return await prisma.client.update({
    where: { id },
    data: { isActive: false },
  });
}

import { Client, ClientPayment } from '@/generated/prisma';

export type ClientWithDetails = Client & {
  sales: Array<{
    id: string;
    saleNumber: string;
    totalAmount: number;
    amountPaid: number;
    createdAt: Date;
  }>;
  payments: Array<{
    id: string;
    amount: number;
    paymentDate: Date;
  }>;
};

export interface RecordClientPaymentResult {
  payment: ClientPayment;
  updatedClient: Client;
}

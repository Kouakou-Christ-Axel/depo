import { Client, ClientPayment } from '@/generated/prisma/client';
import { Decimal } from '@prisma/client/runtime/client';

export type ClientWithDetails = Client & {
  sales: Array<{
    id: string;
    saleNumber: string;
    totalAmount: Decimal;
    amountPaid: Decimal;
    createdAt: Date;
  }>;
  payments: Array<{
    id: string;
    amount: Decimal;
    paymentDate: Date;
  }>;
};

export interface RecordClientPaymentResult {
  payment: ClientPayment;
  updatedClient: Client;
}

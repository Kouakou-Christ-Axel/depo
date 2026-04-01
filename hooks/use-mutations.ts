import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createProductAction } from "@/features/products/actions/createProduct.action";
import { createSaleAction } from "@/features/sales/actions/createSale.action";
import { createPurchaseAction } from "@/features/purchases/actions/createPurchase.action";
import { createSupplierAction } from "@/features/suppliers/actions/supplier.action";
import { createClientAction } from "@/features/clients/actions/createClient.action";
import { updateClientAction } from "@/features/clients/actions/updateClient.action";
import { recordClientPaymentAction } from "@/features/clients/actions/recordClientPayment.action";
import type { CreateProductInput } from "@/features/products/schemas/createProduct.schema";
import type { CreateSupplierInput } from "@/features/suppliers/schemas/supplier.schema";
import type { CreateClientInput, RecordClientPaymentInput } from "@/features/clients/schemas/recordClientPayment.schema";
import type { CreateSaleInput } from "@/features/sales/schemas/createSale.schema";
import type { CreatePurchaseInput } from "@/features/purchases/schemas/createPurchase.schema";
import type { CreateVariantInput } from "@/features/products/schemas/createProduct.schema";
import { createVariantAction } from "@/features/products/actions/createProduct.action";

function useActionMutation<TInput, TData>(
  action: (input: TInput) => Promise<{ success: boolean; data?: TData; error?: string }>,
  invalidateKeys: string[][],
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: TInput) => {
      const result = await action(input);
      if (!result.success) {
        throw new Error(result.error ?? "Erreur inconnue");
      }
      return result.data as TData;
    },
    onSuccess: () => {
      for (const key of invalidateKeys) {
        queryClient.invalidateQueries({ queryKey: key });
      }
    },
  });
}

export function useCreateProduct() {
  return useActionMutation<CreateProductInput, { id: string }>(
    createProductAction,
    [["products"], ["variants"]]
  );
}

export function useCreateVariant() {
  return useActionMutation<CreateVariantInput, { id: string }>(
    createVariantAction,
    [["variants"], ["products"]]
  );
}

export function useCreateSale() {
  return useActionMutation<CreateSaleInput, unknown>(
    createSaleAction,
    [["sales"], ["products"], ["clients-list"], ["clients-all"]]
  );
}

export function useCreatePurchase() {
  return useActionMutation<CreatePurchaseInput, unknown>(
    createPurchaseAction,
    [["purchases"], ["products"], ["suppliers-all"]]
  );
}

export function useCreateSupplier() {
  return useActionMutation<CreateSupplierInput, { id: string; name: string }>(
    (input) => createSupplierAction(input),
    [["suppliers"], ["suppliers-all"]]
  );
}

export function useCreateClient() {
  return useActionMutation<CreateClientInput, { id: string; name: string }>(
    createClientAction,
    [["clients-list"], ["clients-all"]]
  );
}

export function useUpdateClient(clientId: string) {
  return useActionMutation<
    { name?: string; phone?: string; email?: string; address?: string },
    { id: string }
  >(
    (input) => updateClientAction(clientId, input),
    [["clients-list"], ["clients-all"], ["client", clientId]]
  );
}

export function useRecordPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: RecordClientPaymentInput) => {
      const result = await recordClientPaymentAction(input);
      if (!result.success) {
        throw new Error(result.error ?? "Erreur inconnue");
      }
      return result.data as { paymentId: string };
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["clients-list"] });
      queryClient.invalidateQueries({ queryKey: ["client", variables.clientId] });
      queryClient.invalidateQueries({ queryKey: ["sales"] });
    },
  });
}

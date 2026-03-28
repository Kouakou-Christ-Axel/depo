"use client";

import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createPurchaseAction } from "@/features/purchases/actions/createPurchase.action";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Loader2, Receipt } from "lucide-react";
import { useState } from "react";

const formSchema = z.object({
  productVariantId: z.string().min(1, "Choisissez un produit"),
  quantityCasier: z.number().int().positive("La quantité doit être positive"),
  purchasePriceCasier: z.number().positive("Le prix doit être positif"),
  supplierId: z.string().optional(),
  invoiceNumber: z.string().optional(),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

type ProductVariant = {
  id: string;
  casierSize: number;
  sellingPriceCasier: number | string;
  stockHalf: number;
  alertThresholdHalf: number;
  product: { name: string };
  variant: { name: string };
};

type ProductData = {
  id: string;
  name: string;
  variants?: ProductVariant[];
};

type SupplierOption = { id: string; name: string };

async function fetchProducts(): Promise<ProductData[]> {
  const res = await fetch("/api/products");
  if (!res.ok) throw new Error("Erreur chargement produits");
  return res.json();
}

async function fetchSuppliers(): Promise<SupplierOption[]> {
  const res = await fetch("/api/suppliers?type=all");
  if (!res.ok) throw new Error("Erreur chargement fournisseurs");
  return res.json();
}

export function CreatePurchaseForm() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [serverError, setServerError] = useState("");

  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ["products"],
    queryFn: fetchProducts,
  });

  const { data: suppliers = [], isLoading: suppliersLoading } = useQuery({
    queryKey: ["suppliers-all"],
    queryFn: fetchSuppliers,
  });

  const productVariants = products.flatMap((p) =>
    (p.variants ?? []).map((v) => ({
      ...v,
      productName: p.name,
      label: `${p.name} — ${v.variant.name} (${v.casierSize} btl)`,
    }))
  );

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      productVariantId: "",
      quantityCasier: undefined,
      purchasePriceCasier: undefined,
      supplierId: "",
      invoiceNumber: "",
      notes: "",
    },
  });

  const selectedVariantId = watch("productVariantId");
  const quantity = watch("quantityCasier");
  const price = watch("purchasePriceCasier");

  const selectedVariant = productVariants.find(
    (v) => v.id === selectedVariantId
  );
  const total = quantity && price ? quantity * price : 0;

  // Find supplier name for the action
  const selectedSupplierId = watch("supplierId");
  const selectedSupplier = suppliers.find((s) => s.id === selectedSupplierId);

  async function onSubmit(data: FormValues) {
    setServerError("");

    const result = await createPurchaseAction({
      productVariantId: data.productVariantId,
      quantityCasier: data.quantityCasier,
      purchasePriceCasier: data.purchasePriceCasier,
      supplierName: selectedSupplier?.name || undefined,
      invoiceNumber: data.invoiceNumber || undefined,
      notes: data.notes || undefined,
    });

    if (!result.success) {
      setServerError(result.error ?? "Erreur lors de la création");
      return;
    }

    queryClient.invalidateQueries({ queryKey: ["purchases"] });
    queryClient.invalidateQueries({ queryKey: ["products"] });
    router.push("/purchases");
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Receipt className="h-5 w-5" />
          Enregistrer un achat
        </CardTitle>
        <CardDescription>
          L&apos;achat met à jour le stock et recalcule le coût moyen pondéré
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Product selection */}
          <div className="grid gap-2">
            <Label htmlFor="productVariantId">Produit *</Label>
            <select
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs"
              {...register("productVariantId")}
              disabled={productsLoading}
            >
              <option value="">
                {productsLoading ? "Chargement..." : "Choisir un produit..."}
              </option>
              {productVariants.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.label}
                </option>
              ))}
            </select>
            {errors.productVariantId && (
              <p className="text-xs text-destructive">
                {errors.productVariantId.message}
              </p>
            )}
            {selectedVariant && (
              <p className="text-xs text-muted-foreground">
                Stock actuel : {(selectedVariant.stockHalf / 2).toFixed(1)}{" "}
                casiers (seuil :{" "}
                {(selectedVariant.alertThresholdHalf / 2).toFixed(1)}) — Prix
                vente :{" "}
                {Number(selectedVariant.sellingPriceCasier).toLocaleString(
                  "fr-FR"
                )}{" "}
                FCFA/casier
              </p>
            )}
          </div>

          <Separator />

          {/* Supplier & invoice */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="supplierId">Fournisseur</Label>
              <select
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs"
                {...register("supplierId")}
                disabled={suppliersLoading}
              >
                <option value="">
                  {suppliersLoading ? "Chargement..." : "Choisir..."}
                </option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="invoiceNumber">N° de facture</Label>
              <Input
                id="invoiceNumber"
                placeholder="FAC-XXXX"
                {...register("invoiceNumber")}
              />
            </div>
          </div>

          <Separator />

          {/* Quantity & price */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="quantityCasier">Quantité (casiers) *</Label>
              <Input
                id="quantityCasier"
                type="number"
                min={1}
                placeholder="Nombre de casiers"
                {...register("quantityCasier", { valueAsNumber: true })}
              />
              {errors.quantityCasier && (
                <p className="text-xs text-destructive">
                  {errors.quantityCasier.message}
                </p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="purchasePriceCasier">
                Prix d&apos;achat / casier (FCFA) *
              </Label>
              <Input
                id="purchasePriceCasier"
                type="number"
                min={0}
                placeholder="Prix par casier"
                {...register("purchasePriceCasier", { valueAsNumber: true })}
              />
              {errors.purchasePriceCasier && (
                <p className="text-xs text-destructive">
                  {errors.purchasePriceCasier.message}
                </p>
              )}
            </div>
          </div>

          {/* Total preview */}
          {total > 0 && (
            <div className="rounded-lg border bg-muted/50 p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  Total de l&apos;achat
                </span>
                <span className="text-lg font-bold">
                  {total.toLocaleString("fr-FR")} FCFA
                </span>
              </div>
            </div>
          )}

          {/* Notes */}
          <div className="grid gap-2">
            <Label htmlFor="notes">Notes (optionnel)</Label>
            <Input
              id="notes"
              placeholder="Remarques sur l'achat..."
              {...register("notes")}
            />
          </div>

          {serverError && (
            <p className="text-sm text-destructive">{serverError}</p>
          )}

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Enregistrer l&apos;achat
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

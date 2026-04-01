"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createStockAdjustmentAction } from "@/features/stock/actions/createStockAdjustment.action";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Plus } from "lucide-react";

const formSchema = z.object({
  productVariantId: z.string().min(1, "Choisissez un produit"),
  quantityCasier: z.number().refine((v) => v !== 0, "Quantité requise"),
  type: z.enum(["LOSS", "ADJUSTMENT"]),
  notes: z.string().min(1, "Une note est requise"),
});

type FormValues = z.infer<typeof formSchema>;

type ProductVariant = {
  id: string;
  stockHalf: number;
  product: { name: string };
  variant: { name: string };
};

type ProductData = {
  id: string;
  name: string;
  variants?: ProductVariant[];
};

async function fetchProducts(): Promise<ProductData[]> {
  const res = await fetch("/api/products");
  if (!res.ok) throw new Error("Erreur");
  return res.json();
}

export function StockAdjustmentDialog() {
  const [open, setOpen] = useState(false);
  const [serverError, setServerError] = useState("");
  const queryClient = useQueryClient();

  const { data: products = [] } = useQuery({
    queryKey: ["products"],
    queryFn: fetchProducts,
    enabled: open,
  });

  const productVariants = products.flatMap((p) =>
    (p.variants ?? []).map((v) => ({
      ...v,
      label: `${p.name} — ${v.variant.name} (stock: ${(v.stockHalf / 2).toFixed(1)} casiers)`,
    }))
  );

  const mutation = useMutation({
    mutationFn: async (input: { productVariantId: string; quantityHalf: number; type: string; notes: string }) => {
      const result = await createStockAdjustmentAction(input as Parameters<typeof createStockAdjustmentAction>[0]);
      if (!result.success) throw new Error(result.error ?? "Erreur");
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stock-movements"] });
      queryClient.invalidateQueries({ queryKey: ["stock-stats"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      productVariantId: "",
      quantityCasier: 0,
      type: "LOSS",
      notes: "",
    },
  });

  useEffect(() => {
    if (open) {
      reset();
      setServerError("");
    }
  }, [open, reset]);

  const selectedId = watch("productVariantId");
  const watchedQty = watch("quantityCasier");
  const watchedType = watch("type");
  const selectedVariant = productVariants.find((v) => v.id === selectedId);

  // Stock validation
  const stockCasier = selectedVariant ? selectedVariant.stockHalf / 2 : 0;
  const effectiveRetrait =
    watchedType === "LOSS"
      ? Math.abs(watchedQty || 0)
      : watchedQty < 0
        ? Math.abs(watchedQty)
        : 0;
  const exceedsStock = selectedVariant && effectiveRetrait > stockCasier;

  async function onSubmit(data: FormValues) {
    setServerError("");
    if (exceedsStock) {
      setServerError(`Stock insuffisant (${stockCasier.toFixed(1)} casiers dispo)`);
      return;
    }
    try {
      const quantityHalf = Math.round(data.quantityCasier * 2);
      await mutation.mutateAsync({
        productVariantId: data.productVariantId,
        quantityHalf: data.type === "LOSS" ? -Math.abs(quantityHalf) : quantityHalf,
        type: data.type,
        notes: data.notes,
      });
      setOpen(false);
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Erreur");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Ajustement
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Ajustement de stock</DialogTitle>
          <DialogDescription>
            Enregistrer une perte, casse ou correction manuelle
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-2">
            <Label>Produit *</Label>
            <select
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs"
              {...register("productVariantId")}
            >
              <option value="">Choisir...</option>
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
                Stock actuel : {(selectedVariant.stockHalf / 2).toFixed(1)} casiers
              </p>
            )}
          </div>

          <div className="grid gap-2">
            <Label>Type *</Label>
            <select
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs"
              {...register("type")}
            >
              <option value="LOSS">Perte / Casse (retire du stock)</option>
              <option value="ADJUSTMENT">Ajustement (ajoute ou retire)</option>
            </select>
          </div>

          <div className="grid gap-2">
            <Label>Quantité (casiers) *</Label>
            <Input
              type="number"
              step={0.5}
              placeholder="Ex: -2 (retrait) ou 3 (ajout)"
              {...register("quantityCasier", {
                setValueAs: (v: string) => (v === "" ? 0 : Number(v)),
              })}
            />
            {errors.quantityCasier && (
              <p className="text-xs text-destructive">
                {errors.quantityCasier.message}
              </p>
            )}
            {exceedsStock && (
              <p className="text-xs text-destructive">
                Stock insuffisant ({stockCasier.toFixed(1)} casiers disponibles)
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              Perte : entrez un nombre positif (sera retiré). Ajustement : positif = ajout, négatif = retrait.
            </p>
          </div>

          <div className="grid gap-2">
            <Label>Raison / Notes *</Label>
            <Input
              placeholder="Ex: Casse lors du transport, Inventaire..."
              {...register("notes")}
            />
            {errors.notes && (
              <p className="text-xs text-destructive">{errors.notes.message}</p>
            )}
          </div>

          {serverError && (
            <p className="text-sm text-destructive">{serverError}</p>
          )}

          <Button type="submit" className="w-full" disabled={mutation.isPending || !!exceedsStock}>
            {mutation.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Enregistrer l&apos;ajustement
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateSale, useCreateClient } from "@/hooks/use-mutations";
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
import {
  Plus,
  Trash2,
  Loader2,
  ShoppingCart,
  UserPlus,
  AlertTriangle,
} from "lucide-react";
import { useState, useMemo } from "react";

const formSchema = z.object({
  items: z
    .array(
      z.object({
        productVariantId: z.string().min(1, "Choisissez un produit"),
        quantityCasier: z
          .number()
          .positive("Quantité requise (0.5 ou 1 casier min)"),
      })
    )
    .min(1, "Au moins un article"),
  clientId: z.string().optional(),
  amountPaid: z.number().min(0),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

type ProductVariant = {
  id: string;
  casierSize: number;
  sellingPriceCasier: number | string;
  stockHalf: number;
  product: { name: string };
  variant: { name: string };
};

type ProductData = {
  id: string;
  name: string;
  variants?: ProductVariant[];
};

type ClientOption = { id: string; name: string };

async function fetchProducts(): Promise<ProductData[]> {
  const res = await fetch("/api/products");
  if (!res.ok) throw new Error("Erreur");
  return res.json();
}

async function fetchClients(): Promise<ClientOption[]> {
  const res = await fetch("/api/clients?type=all");
  if (!res.ok) return [];
  return res.json();
}

export function CreateSaleForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState("");
  const [newClient, setNewClient] = useState(false);
  const [newClientName, setNewClientName] = useState("");
  const [newClientPhone, setNewClientPhone] = useState("");

  const saleMutation = useCreateSale();
  const clientMutation = useCreateClient();

  const { data: products = [] } = useQuery({
    queryKey: ["products"],
    queryFn: fetchProducts,
  });

  const { data: clients = [] } = useQuery({
    queryKey: ["clients-all"],
    queryFn: fetchClients,
  });

  const productVariants = useMemo(
    () =>
      products.flatMap((p) =>
        (p.variants ?? []).map((v) => ({
          ...v,
          productName: p.name,
          label: `${p.name} — ${v.variant.name} (stock: ${(v.stockHalf / 2).toFixed(1)} casiers)`,
          priceCasier: Number(v.sellingPriceCasier) || 0,
          stockCasier: v.stockHalf / 2,
        }))
      ),
    [products]
  );

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      items: [{ productVariantId: "", quantityCasier: 0.5 }],
      clientId: "",
      amountPaid: 0,
      notes: "",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  const watchedItems = useWatch({ control, name: "items" }) ?? [];
  const watchedAmountPaid = useWatch({ control, name: "amountPaid" }) ?? 0;
  const watchedClientId = useWatch({ control, name: "clientId" });

  // Stock validation per item
  const stockErrors = useMemo(() => {
    const errs: Record<number, string> = {};
    for (let i = 0; i < watchedItems.length; i++) {
      const item = watchedItems[i];
      if (!item.productVariantId) continue;
      const variant = productVariants.find(
        (v) => v.id === item.productVariantId
      );
      if (!variant) continue;
      const qty = item.quantityCasier || 0;
      if (qty > variant.stockCasier) {
        errs[i] =
          `Stock insuffisant (${variant.stockCasier.toFixed(1)} casiers dispo)`;
      }
    }
    return errs;
  }, [watchedItems, productVariants]);

  const hasStockErrors = Object.keys(stockErrors).length > 0;

  const total = watchedItems.reduce((sum, item) => {
    const variant = productVariants.find(
      (v) => v.id === item.productVariantId
    );
    if (!variant) return sum;
    return sum + variant.priceCasier * (item.quantityCasier || 0);
  }, 0);

  const remaining = total - (watchedAmountPaid || 0);
  const isComptoir = !newClient && !watchedClientId;
  const isCreditOnComptoir = isComptoir && total > 0 && remaining > 0;
  const isPending = saleMutation.isPending || clientMutation.isPending;

  async function onSubmit(data: FormValues) {
    setServerError("");

    if (hasStockErrors) {
      setServerError("Stock insuffisant pour un ou plusieurs articles");
      return;
    }

    try {
      // Create inline client if needed
      let clientId = data.clientId || undefined;
      if (newClient && newClientName.trim()) {
        const newClientData = await clientMutation.mutateAsync({
          name: newClientName.trim(),
          phone: newClientPhone.trim() || undefined,
        });
        clientId = newClientData.id;
      }

      // Convert casiers to half-casiers for the API
      const items = data.items.map((item) => ({
        productVariantId: item.productVariantId,
        quantityHalf: Math.round(item.quantityCasier * 2),
      }));

      await saleMutation.mutateAsync({
        items,
        clientId,
        amountPaid: data.amountPaid || 0,
        notes: data.notes || undefined,
      });

      router.push("/sales");
    } catch (err) {
      setServerError(
        err instanceof Error ? err.message : "Erreur lors de la création"
      );
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShoppingCart className="h-5 w-5" />
          Nouvelle vente
        </CardTitle>
        <CardDescription>
          Le stock sera automatiquement décrémenté
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Items */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Articles</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  append({ productVariantId: "", quantityCasier: 0.5 })
                }
              >
                <Plus className="h-3 w-3 mr-1" />
                Ajouter
              </Button>
            </div>

            {errors.items?.root && (
              <p className="text-xs text-destructive">
                {errors.items.root.message}
              </p>
            )}

            {fields.map((field, index) => {
              const selectedId = watchedItems[index]?.productVariantId;
              const selectedVariant = productVariants.find(
                (v) => v.id === selectedId
              );
              const qty = watchedItems[index]?.quantityCasier || 0;
              const lineTotal = selectedVariant
                ? selectedVariant.priceCasier * qty
                : 0;
              const stockErr = stockErrors[index];

              return (
                <div key={field.id} className="space-y-1">
                  <div className="grid grid-cols-[2fr_1fr_auto_auto] gap-2 items-end">
                    <div>
                      {index === 0 && (
                        <Label className="text-xs text-muted-foreground">
                          Produit
                        </Label>
                      )}
                      <select
                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs"
                        {...register(`items.${index}.productVariantId`)}
                      >
                        <option value="">Choisir...</option>
                        {productVariants.map((v) => (
                          <option key={v.id} value={v.id}>
                            {v.label}
                          </option>
                        ))}
                      </select>
                      {errors.items?.[index]?.productVariantId && (
                        <p className="text-xs text-destructive">
                          {errors.items[index].productVariantId.message}
                        </p>
                      )}
                    </div>

                    <div>
                      {index === 0 && (
                        <Label className="text-xs text-muted-foreground">
                          Qté (casiers)
                        </Label>
                      )}
                      <Input
                        type="number"
                        min={0.5}
                        step={0.5}
                        max={
                          selectedVariant ? selectedVariant.stockCasier : 999
                        }
                        className={stockErr ? "border-destructive" : ""}
                        {...register(`items.${index}.quantityCasier`, {
                          setValueAs: (v: string) =>
                            v === "" ? 0 : Number(v),
                        })}
                      />
                    </div>

                    <div className="text-right min-w-[100px] pb-1 text-sm">
                      {lineTotal > 0
                        ? `${lineTotal.toLocaleString("fr-FR")} FCFA`
                        : ""}
                    </div>

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9"
                      onClick={() => remove(index)}
                      disabled={fields.length <= 1}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                  {stockErr && (
                    <p className="text-xs text-destructive flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      {stockErr}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          <Separator />

          {/* Client */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Client</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setNewClient(!newClient)}
              >
                <UserPlus className="h-3 w-3 mr-1" />
                {newClient ? "Client existant" : "Nouveau client"}
              </Button>
            </div>

            {newClient ? (
              <div className="grid gap-3 sm:grid-cols-2 rounded-lg border p-3">
                <div className="grid gap-1">
                  <Label className="text-xs text-muted-foreground">
                    Nom *
                  </Label>
                  <Input
                    placeholder="Nom du client"
                    value={newClientName}
                    onChange={(e) => setNewClientName(e.target.value)}
                  />
                </div>
                <div className="grid gap-1">
                  <Label className="text-xs text-muted-foreground">
                    Téléphone
                  </Label>
                  <Input
                    placeholder="+237 6XX XXX XXX"
                    value={newClientPhone}
                    onChange={(e) => setNewClientPhone(e.target.value)}
                  />
                </div>
              </div>
            ) : (
              <select
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs"
                {...register("clientId")}
              >
                <option value="">Vente comptoir (sans client)</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Total & payment */}
          <div className="rounded-lg border bg-muted/50 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Total</span>
              <span className="text-lg font-bold">
                {total.toLocaleString("fr-FR")} FCFA
              </span>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="amountPaid" className="text-sm">
                Montant payé (FCFA)
              </Label>
              <Input
                id="amountPaid"
                type="number"
                min={0}
                {...register("amountPaid", {
                  setValueAs: (v: string) => (v === "" ? 0 : Number(v)),
                })}
              />
            </div>

            {total > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span>Reste à payer</span>
                <span
                  className={
                    remaining > 0
                      ? "text-destructive font-medium"
                      : "text-green-600 font-medium"
                  }
                >
                  {remaining > 0
                    ? `${remaining.toLocaleString("fr-FR")} FCFA`
                    : "Payée"}
                </span>
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="grid gap-2">
            <Label htmlFor="notes">Notes (optionnel)</Label>
            <Input
              id="notes"
              placeholder="Remarques..."
              {...register("notes")}
            />
          </div>

          {isCreditOnComptoir && (
            <p className="text-sm text-destructive flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" />
              Vente comptoir : le montant payé doit couvrir le total. Ajoutez un client pour autoriser le crédit.
            </p>
          )}

          {serverError && (
            <p className="text-sm text-destructive">{serverError}</p>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={isPending || total === 0 || hasStockErrors || isCreditOnComptoir}
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Enregistrer la vente
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

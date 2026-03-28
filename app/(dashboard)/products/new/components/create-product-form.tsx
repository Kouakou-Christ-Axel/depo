"use client";

import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createProductAction } from "@/features/products/actions/createProduct.action";
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
import { Plus, Trash2, Loader2 } from "lucide-react";
import { useState } from "react";

const formSchema = z.object({
  name: z.string().min(1, "Le nom est requis"),
  description: z.string().optional(),
  variants: z
    .array(
      z.object({
        variantId: z.string().min(1, "Choisissez une taille"),
        casierSize: z.union([z.literal(12), z.literal(24)]),
        sellingPriceCasier: z
          .number()
          .positive("Le prix doit être positif"),
        alertThresholdHalf: z.number().int().min(0),
      })
    )
    .min(1, "Au moins une variante est requise"),
});

type FormValues = z.infer<typeof formSchema>;

async function fetchVariants() {
  const res = await fetch("/api/products?type=variants");
  if (!res.ok) throw new Error("Erreur chargement variantes");
  return res.json() as Promise<{ id: string; name: string; sizeInMl: number }[]>;
}

export function CreateProductForm() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [serverError, setServerError] = useState("");

  const { data: variants = [], isLoading: variantsLoading } = useQuery({
    queryKey: ["variants"],
    queryFn: fetchVariants,
  });

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      variants: [
        { variantId: "", casierSize: 12, sellingPriceCasier: 0, alertThresholdHalf: 10 },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "variants",
  });

  async function onSubmit(data: FormValues) {
    setServerError("");
    const result = await createProductAction({
      name: data.name,
      description: data.description || undefined,
      variants: data.variants.map((v) => ({
        ...v,
        casierSize: v.casierSize as 12 | 24,
      })),
    });

    if (!result.success) {
      setServerError(result.error ?? "Erreur lors de la création");
      return;
    }

    reset();
    queryClient.invalidateQueries({ queryKey: ["products"] });
    router.push("/products");
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Nouveau produit</CardTitle>
        <CardDescription>
          Ajoutez un produit avec ses variantes et prix
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Nom du produit</Label>
            <Input
              id="name"
              placeholder="Ex: Heineken, Coca-Cola..."
              {...register("name")}
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">Description (optionnel)</Label>
            <Input
              id="description"
              placeholder="Description du produit"
              {...register("description")}
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Variantes</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  append({
                    variantId: "",
                    casierSize: 12,
                    sellingPriceCasier: 0,
                    alertThresholdHalf: 10,
                  })
                }
              >
                <Plus className="h-3 w-3 mr-1" />
                Ajouter
              </Button>
            </div>

            {errors.variants?.root && (
              <p className="text-xs text-destructive">
                {errors.variants.root.message}
              </p>
            )}

            {fields.map((field, index) => (
              <div
                key={field.id}
                className="grid grid-cols-[1fr_auto_1fr_auto] gap-2 items-end"
              >
                <div>
                  {index === 0 && (
                    <Label className="text-xs text-muted-foreground">
                      Taille
                    </Label>
                  )}
                  <select
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs"
                    {...register(`variants.${index}.variantId`)}
                    disabled={variantsLoading}
                  >
                    <option value="">
                      {variantsLoading ? "Chargement..." : "Choisir..."}
                    </option>
                    {variants.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.name}
                      </option>
                    ))}
                  </select>
                  {errors.variants?.[index]?.variantId && (
                    <p className="text-xs text-destructive">
                      {errors.variants[index].variantId.message}
                    </p>
                  )}
                </div>

                <div>
                  {index === 0 && (
                    <Label className="text-xs text-muted-foreground">
                      Casier
                    </Label>
                  )}
                  <select
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs"
                    {...register(`variants.${index}.casierSize`, {
                      valueAsNumber: true,
                    })}
                  >
                    <option value={12}>12 btl</option>
                    <option value={24}>24 btl</option>
                  </select>
                </div>

                <div>
                  {index === 0 && (
                    <Label className="text-xs text-muted-foreground">
                      Prix/casier (FCFA)
                    </Label>
                  )}
                  <Input
                    type="number"
                    min={0}
                    placeholder="Prix"
                    {...register(`variants.${index}.sellingPriceCasier`, {
                      valueAsNumber: true,
                    })}
                  />
                  {errors.variants?.[index]?.sellingPriceCasier && (
                    <p className="text-xs text-destructive">
                      {errors.variants[index].sellingPriceCasier.message}
                    </p>
                  )}
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
            ))}
          </div>

          {serverError && (
            <p className="text-sm text-destructive">{serverError}</p>
          )}

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Créer le produit
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

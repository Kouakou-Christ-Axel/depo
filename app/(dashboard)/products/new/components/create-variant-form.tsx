"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createVariantAction } from "@/features/products/actions/createProduct.action";
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
import { Loader2, Check } from "lucide-react";
import { useState } from "react";

const formSchema = z.object({
  name: z.string().min(1, "Le nom est requis"),
  sizeInMl: z.number().int().positive("La taille doit être positive"),
  description: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function CreateVariantForm() {
  const queryClient = useQueryClient();
  const [serverError, setServerError] = useState("");
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      sizeInMl: undefined,
      description: "",
    },
  });

  async function onSubmit(data: FormValues) {
    setServerError("");
    setSuccess(false);

    const result = await createVariantAction({
      name: data.name,
      sizeInMl: data.sizeInMl,
      description: data.description || undefined,
    });

    if (!result.success) {
      setServerError(result.error ?? "Erreur lors de la création");
      return;
    }

    reset();
    setSuccess(true);
    queryClient.invalidateQueries({ queryKey: ["variants"] });
    setTimeout(() => setSuccess(false), 3000);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Nouvelle taille</CardTitle>
        <CardDescription>
          Ajoutez une taille de bouteille (ex: 33cl, 66cl, 1L)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="variant-name">Nom</Label>
            <Input
              id="variant-name"
              placeholder="Ex: 33cl, 66cl, 1L..."
              {...register("name")}
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="variant-size">Taille en ml</Label>
            <Input
              id="variant-size"
              type="number"
              min={1}
              placeholder="Ex: 330, 660, 1000"
              {...register("sizeInMl", { valueAsNumber: true })}
            />
            {errors.sizeInMl && (
              <p className="text-xs text-destructive">
                {errors.sizeInMl.message}
              </p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="variant-desc">Description (optionnel)</Label>
            <Input
              id="variant-desc"
              placeholder="Description"
              {...register("description")}
            />
          </div>

          {serverError && (
            <p className="text-sm text-destructive">{serverError}</p>
          )}

          {success && (
            <p className="text-sm text-green-600 flex items-center gap-1">
              <Check className="h-3 w-3" />
              Taille créée avec succès
            </p>
          )}

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Créer la taille
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

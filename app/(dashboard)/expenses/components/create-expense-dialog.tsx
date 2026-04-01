"use client";

import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createExpenseAction } from "@/features/expenses/actions/expense.action";
import {
  createExpenseSchema,
  type CreateExpenseInput,
} from "@/features/expenses/schemas/expense.schema";
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
import { EXPENSE_CATEGORIES } from "@/lib/constants";

export function CreateExpenseDialog() {
  const [open, setOpen] = useState(false);
  const [serverError, setServerError] = useState("");
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (input: CreateExpenseInput) => {
      const result = await createExpenseAction(input);
      if (!result.success) throw new Error(result.error ?? "Erreur");
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      queryClient.invalidateQueries({ queryKey: ["expense-stats"] });
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateExpenseInput>({
    resolver: zodResolver(createExpenseSchema),
    defaultValues: {
      category: "",
      description: "",
      amount: 0,
      expenseDate: new Date().toISOString().slice(0, 10),
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        category: "",
        description: "",
        amount: 0,
        expenseDate: new Date().toISOString().slice(0, 10),
      });
      setServerError("");
    }
  }, [open, reset]);

  async function onSubmit(data: CreateExpenseInput) {
    setServerError("");
    try {
      await mutation.mutateAsync(data);
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
          Nouvelle dépense
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nouvelle dépense</DialogTitle>
          <DialogDescription>
            Enregistrer une dépense opérationnelle
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label>Catégorie *</Label>
              <select
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs"
                {...register("category")}
              >
                <option value="">Choisir...</option>
                {EXPENSE_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="text-xs text-destructive">
                  {errors.category.message}
                </p>
              )}
            </div>
            <div className="grid gap-2">
              <Label>Date</Label>
              <Input type="date" {...register("expenseDate")} />
            </div>
          </div>

          <div className="grid gap-2">
            <Label>Description *</Label>
            <Input
              placeholder="Ex: Transport de marchandises..."
              {...register("description")}
            />
            {errors.description && (
              <p className="text-xs text-destructive">
                {errors.description.message}
              </p>
            )}
          </div>

          <div className="grid gap-2">
            <Label>Montant (FCFA) *</Label>
            <Input
              type="number"
              min={1}
              placeholder="Montant"
              {...register("amount", {
                setValueAs: (v: string) => (v === "" ? 0 : Number(v)),
              })}
            />
            {errors.amount && (
              <p className="text-xs text-destructive">
                {errors.amount.message}
              </p>
            )}
          </div>

          {serverError && (
            <p className="text-sm text-destructive">{serverError}</p>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={mutation.isPending}
          >
            {mutation.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Enregistrer la dépense
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

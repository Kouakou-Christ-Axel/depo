"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useUpdateClient } from "@/hooks/use-mutations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Save } from "lucide-react";
import { useState } from "react";

const formSchema = z.object({
  name: z.string().min(1, "Le nom est requis"),
  phone: z.string().optional(),
  email: z.string().email("Email invalide").optional().or(z.literal("")),
  address: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface ClientEditFormProps {
  client: {
    id: string;
    name: string;
    phone: string | null;
    email: string | null;
    address: string | null;
  };
  onSuccess: () => void;
}

export function ClientEditForm({ client, onSuccess }: ClientEditFormProps) {
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: client.name,
      phone: client.phone ?? "",
      email: client.email ?? "",
      address: client.address ?? "",
    },
  });

  const updateMutation = useUpdateClient(client.id);

  async function onSubmit(data: FormValues) {
    setServerError("");
    try {
      await updateMutation.mutateAsync({
        name: data.name,
        phone: data.phone || undefined,
        email: data.email || undefined,
        address: data.address || undefined,
      });
      onSuccess();
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Erreur");
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Nom *</Label>
              <Input id="edit-name" {...register("name")} />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-phone">Téléphone</Label>
              <Input id="edit-phone" {...register("phone")} />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input id="edit-email" type="email" {...register("email")} />
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-address">Adresse</Label>
              <Input id="edit-address" {...register("address")} />
            </div>
          </div>
          {serverError && <p className="text-sm text-destructive">{serverError}</p>}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Enregistrer
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

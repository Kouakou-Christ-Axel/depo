"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import {
  createClientSchema,
  type CreateClientInput,
} from "@/features/clients/schemas/recordClientPayment.schema";
import { useCreateClient } from "@/hooks/use-mutations";
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
import { ArrowLeft, Loader2, Users } from "lucide-react";
import { useState } from "react";

export default function NewClientPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState("");
  const clientMutation = useCreateClient();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateClientInput>({
    resolver: zodResolver(createClientSchema),
    defaultValues: { name: "", phone: "", address: "", email: "" },
  });

  async function onSubmit(data: CreateClientInput) {
    setServerError("");
    try {
      await clientMutation.mutateAsync(data);
      router.push("/clients");
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Erreur");
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/clients">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Nouveau client</h1>
          <p className="text-muted-foreground">Ajouter un client</p>
        </div>
      </div>

      <div className="max-w-lg">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Nouveau client
            </CardTitle>
            <CardDescription>Coordonnées du client</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Nom *</Label>
                <Input id="name" placeholder="Nom du client" {...register("name")} />
                {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="phone">Téléphone</Label>
                  <Input id="phone" placeholder="+237 6XX XXX XXX" {...register("phone")} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="email@exemple.com" {...register("email")} />
                  {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="address">Adresse</Label>
                <Input id="address" placeholder="Adresse du client" {...register("address")} />
              </div>
              {serverError && <p className="text-sm text-destructive">{serverError}</p>}
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Créer le client
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

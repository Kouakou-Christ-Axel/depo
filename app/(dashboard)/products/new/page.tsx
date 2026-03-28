import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { CreateProductForm } from "./components/create-product-form";
import { CreateVariantForm } from "./components/create-variant-form";

export default function NewProductPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/products">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Nouveau produit</h1>
          <p className="text-muted-foreground">
            Créez un produit ou une nouvelle taille de bouteille
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <CreateProductForm />
        <CreateVariantForm />
      </div>
    </div>
  );
}

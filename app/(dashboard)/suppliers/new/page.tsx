import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { CreateSupplierForm } from "./components/create-supplier-form";

export default function NewSupplierPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/suppliers">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Nouveau fournisseur
          </h1>
          <p className="text-muted-foreground">
            Ajouter un fournisseur de boissons
          </p>
        </div>
      </div>

      <div className="max-w-lg">
        <CreateSupplierForm />
      </div>
    </div>
  );
}

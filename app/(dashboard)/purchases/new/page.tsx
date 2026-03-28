import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { CreatePurchaseForm } from "./components/create-purchase-form";

export default function NewPurchasePage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/purchases">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Nouvel achat</h1>
          <p className="text-muted-foreground">
            Enregistrer un achat fournisseur
          </p>
        </div>
      </div>

      <div className="max-w-2xl">
        <CreatePurchaseForm />
      </div>
    </div>
  );
}

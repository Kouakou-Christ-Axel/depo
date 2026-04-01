import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { CreateSaleForm } from "./components/create-sale-form";

export default function NewSalePage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/sales">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Nouvelle vente</h1>
          <p className="text-muted-foreground">
            Enregistrer une vente avec décrément automatique du stock
          </p>
        </div>
      </div>

      <div className="max-w-3xl">
        <CreateSaleForm />
      </div>
    </div>
  );
}

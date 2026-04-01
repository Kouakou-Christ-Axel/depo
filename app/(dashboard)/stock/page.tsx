import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Warehouse } from "lucide-react";
import { StockStats } from "./components/stock-stats";
import { StockMovementsView } from "./components/stock-movements-view";
import { StockAdjustmentDialog } from "./components/stock-adjustment-dialog";

export default function StockPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Stock</h1>
          <p className="text-muted-foreground">
            Suivi des stocks, mouvements et ajustements
          </p>
        </div>
        <StockAdjustmentDialog />
      </div>

      <StockStats />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Warehouse className="h-4 w-4" />
            Mouvements de stock
          </CardTitle>
          <CardDescription>
            Historique des entrées, sorties, pertes et ajustements
          </CardDescription>
        </CardHeader>
        <CardContent>
          <StockMovementsView />
        </CardContent>
      </Card>
    </div>
  );
}

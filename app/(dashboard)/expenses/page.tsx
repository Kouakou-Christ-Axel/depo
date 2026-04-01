import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TrendingDown } from "lucide-react";
import { ExpenseStats } from "./components/expense-stats";
import { ExpensesView } from "./components/expenses-view";
import { CreateExpenseDialog } from "./components/create-expense-dialog";

export default function ExpensesPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dépenses</h1>
          <p className="text-muted-foreground">
            Suivi des dépenses par catégorie
          </p>
        </div>
        <CreateExpenseDialog />
      </div>

      <ExpenseStats />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingDown className="h-4 w-4" />
            Historique des dépenses
          </CardTitle>
          <CardDescription>
            Filtrez par catégorie ou recherchez par description
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ExpensesView />
        </CardContent>
      </Card>
    </div>
  );
}

"use client";

import { useQuery } from "@tanstack/react-query";
import { parseAsString, useQueryState } from "nuqs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BarChart3,
  TrendingUp,
  Banknote,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Percent,
  Clock,
  AlertTriangle,
  RotateCcw,
} from "lucide-react";
import { useMemo } from "react";
import { RevenueChart } from "./components/revenue-chart";
import { ExpensePieChart } from "./components/expense-pie-chart";
import { TopProductsTable } from "./components/top-products-table";
import { TopClientsTable } from "./components/top-clients-table";

function getPresetDates(preset: string) {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();

  switch (preset) {
    case "today":
      return { start: new Date(y, m, now.getDate()), end: now };
    case "7d":
      return { start: new Date(y, m, now.getDate() - 7), end: now };
    case "month":
      return { start: new Date(y, m, 1), end: now };
    case "last-month":
      return {
        start: new Date(y, m - 1, 1),
        end: new Date(y, m, 0),
      };
    case "quarter":
      return { start: new Date(y, Math.floor(m / 3) * 3, 1), end: now };
    case "year":
      return { start: new Date(y, 0, 1), end: now };
    default:
      return { start: new Date(y, m, 1), end: now };
  }
}

function fmt(d: Date) {
  return d.toISOString().slice(0, 10);
}

interface Analytics {
  overview: {
    totalCA: number;
    totalEncaissements: number;
    totalExpenses: number;
    totalCOGS: number;
    grossProfit: number;
    netProfit: number;
    grossMarginPct: number;
    recoveryRate: number;
    avgBasket: number;
    salesCount: number;
    stockRotation: number;
  };
  debt: {
    totalDebt: number;
    clientsWithDebt: number;
    avgRecoveryDays: number;
  };
  chartData: { date: string; ca: number; depenses: number }[];
  expensesByCategory: { category: string; total: number; pct: number }[];
  topProducts: {
    name: string;
    quantityCasier: number;
    ca: number;
    pctCA: number;
  }[];
  topClients: {
    name: string;
    salesCount: number;
    totalBought: number;
    debt: number;
  }[];
}

export default function ReportsPage() {
  const [preset, setPreset] = useQueryState(
    "p",
    parseAsString.withDefault("month")
  );
  const [customStart, setCustomStart] = useQueryState("start", parseAsString);
  const [customEnd, setCustomEnd] = useQueryState("end", parseAsString);

  const { start, end } = useMemo(() => {
    if (preset === "custom" && customStart && customEnd) {
      return { start: new Date(customStart), end: new Date(customEnd) };
    }
    return getPresetDates(preset);
  }, [preset, customStart, customEnd]);

  const { data, isLoading } = useQuery({
    queryKey: ["analytics", fmt(start), fmt(end)],
    queryFn: async (): Promise<Analytics> => {
      const res = await fetch(
        `/api/reports?start=${fmt(start)}&end=${fmt(end)}`
      );
      if (!res.ok) throw new Error("Erreur");
      return res.json();
    },
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Rapports</h1>
          <p className="text-muted-foreground">
            Analyse de l&apos;activité sur la période
          </p>
        </div>

        {/* Period filters */}
        <div className="flex items-center gap-2 flex-wrap">
          <select
            className="flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs"
            value={preset}
            onChange={(e) => setPreset(e.target.value)}
          >
            <option value="today">Aujourd&apos;hui</option>
            <option value="7d">7 derniers jours</option>
            <option value="month">Ce mois</option>
            <option value="last-month">Mois dernier</option>
            <option value="quarter">Ce trimestre</option>
            <option value="year">Cette année</option>
            <option value="custom">Personnalisé</option>
          </select>

          {preset === "custom" && (
            <>
              <div className="flex items-center gap-1">
                <Label className="text-xs">Du</Label>
                <Input
                  type="date"
                  className="h-9 w-36"
                  value={customStart ?? ""}
                  onChange={(e) => setCustomStart(e.target.value || null)}
                />
              </div>
              <div className="flex items-center gap-1">
                <Label className="text-xs">Au</Label>
                <Input
                  type="date"
                  className="h-9 w-36"
                  value={customEnd ?? ""}
                  onChange={(e) => setCustomEnd(e.target.value || null)}
                />
              </div>
            </>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className="h-[100px]" />
            ))}
          </div>
          <Skeleton className="h-[350px]" />
        </div>
      ) : data ? (
        <>
          {/* Overview cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Chiffre d'affaires"
              value={`${data.overview.totalCA.toLocaleString("fr-FR")} FCFA`}
              desc={`${data.overview.salesCount} vente(s)`}
              icon={TrendingUp}
            />
            <StatCard
              title="Encaissements"
              value={`${data.overview.totalEncaissements.toLocaleString("fr-FR")} FCFA`}
              desc={`Taux: ${data.overview.recoveryRate}%`}
              icon={Banknote}
            />
            <StatCard
              title="Dépenses"
              value={`${data.overview.totalExpenses.toLocaleString("fr-FR")} FCFA`}
              desc={`COGS: ${data.overview.totalCOGS.toLocaleString("fr-FR")}`}
              icon={TrendingDown}
            />
            <StatCard
              title="Bénéfice net"
              value={`${data.overview.netProfit.toLocaleString("fr-FR")} FCFA`}
              desc={`Marge brute: ${data.overview.grossMarginPct}%`}
              icon={DollarSign}
              className={data.overview.netProfit < 0 ? "text-destructive" : "text-green-600"}
            />
            <StatCard
              title="Panier moyen"
              value={`${data.overview.avgBasket.toLocaleString("fr-FR")} FCFA`}
              desc="Par vente"
              icon={ShoppingCart}
            />
            <StatCard
              title="Taux recouvrement"
              value={`${data.overview.recoveryRate}%`}
              desc="Encaissé / Facturé"
              icon={Percent}
            />
            <StatCard
              title="Argent dehors"
              value={`${data.debt.totalDebt.toLocaleString("fr-FR")} FCFA`}
              desc={`${data.debt.clientsWithDebt} client(s)`}
              icon={AlertTriangle}
              className={data.debt.totalDebt > 0 ? "text-destructive" : ""}
            />
            <StatCard
              title="Délai recouvrement"
              value={data.debt.avgRecoveryDays > 0 ? `${data.debt.avgRecoveryDays} jours` : "—"}
              desc="Moyenne entre vente et paiement"
              icon={Clock}
            />
          </div>

          {/* Charts */}
          <div className="grid gap-4 lg:grid-cols-5">
            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  CA vs Dépenses
                </CardTitle>
                <CardDescription>Évolution journalière</CardDescription>
              </CardHeader>
              <CardContent>
                <RevenueChart data={data.chartData} />
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Répartition des dépenses</CardTitle>
                <CardDescription>Par catégorie</CardDescription>
              </CardHeader>
              <CardContent>
                <ExpensePieChart data={data.expensesByCategory} />
              </CardContent>
            </Card>
          </div>

          {/* Rotation stock */}
          <div className="grid gap-4 sm:grid-cols-2">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <RotateCcw className="h-4 w-4" />
                  Rotation du stock
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {data.overview.stockRotation}x
                </div>
                <p className="text-xs text-muted-foreground">
                  COGS / Valeur stock (plus c&apos;est élevé, mieux c&apos;est)
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Bénéfice brut
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${data.overview.grossProfit >= 0 ? "text-green-600" : "text-destructive"}`}>
                  {data.overview.grossProfit.toLocaleString("fr-FR")} FCFA
                </div>
                <p className="text-xs text-muted-foreground">
                  CA ({data.overview.totalCA.toLocaleString("fr-FR")}) - COGS ({data.overview.totalCOGS.toLocaleString("fr-FR")})
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Tables */}
          <div className="grid gap-4 lg:grid-cols-2">
            <TopProductsTable data={data.topProducts} />
            <TopClientsTable data={data.topClients} />
          </div>
        </>
      ) : null}
    </div>
  );
}

function StatCard({
  title,
  value,
  desc,
  icon: Icon,
  className,
}: {
  title: string;
  value: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
  className?: string;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${className || ""}`}>{value}</div>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </CardContent>
    </Card>
  );
}

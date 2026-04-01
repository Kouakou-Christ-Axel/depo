"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Warehouse,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  PackageX,
  ArrowDownToLine,
  ArrowUpFromLine,
  Trash2,
} from "lucide-react";

interface StockStatsData {
  totalProducts: number;
  totalStockCasier: number;
  totalValue: number;
  lowStockCount: number;
  outOfStockCount: number;
  movements: Record<string, { count: number; totalHalf: number }>;
}

export function StockStats() {
  const { data, isLoading } = useQuery({
    queryKey: ["stock-stats"],
    queryFn: async (): Promise<StockStatsData> => {
      const res = await fetch("/api/stock?type=stats");
      if (!res.ok) throw new Error("Erreur");
      return res.json();
    },
  });

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-[100px]" />
        ))}
      </div>
    );
  }

  if (!data) return null;

  const inCount = data.movements.IN?.count ?? 0;
  const outCount = data.movements.OUT?.count ?? 0;
  const lossCount = data.movements.LOSS?.count ?? 0;
  const inCasiers = (data.movements.IN?.totalHalf ?? 0) / 2;
  const outCasiers = Math.abs((data.movements.OUT?.totalHalf ?? 0)) / 2;
  const lossCasiers = Math.abs((data.movements.LOSS?.totalHalf ?? 0)) / 2;

  const stats = [
    {
      title: "Stock total",
      value: `${data.totalStockCasier.toFixed(1)} casiers`,
      description: `${data.totalProducts} produit(s) actif(s)`,
      icon: Warehouse,
    },
    {
      title: "Valeur du stock",
      value: `${Math.round(data.totalValue).toLocaleString("fr-FR")} FCFA`,
      description: "Au coût moyen pondéré",
      icon: TrendingUp,
    },
    {
      title: "Alertes",
      value: `${data.lowStockCount}`,
      description: `${data.outOfStockCount} en rupture`,
      icon: data.lowStockCount > 0 ? AlertTriangle : Warehouse,
      className: data.lowStockCount > 0 ? "text-orange-500" : "",
    },
    {
      title: "Entrées",
      value: `${inCasiers.toFixed(1)} casiers`,
      description: `${inCount} mouvement(s)`,
      icon: ArrowDownToLine,
    },
    {
      title: "Sorties (ventes)",
      value: `${outCasiers.toFixed(1)} casiers`,
      description: `${outCount} mouvement(s)`,
      icon: ArrowUpFromLine,
    },
    {
      title: "Pertes / casses",
      value: `${lossCasiers.toFixed(1)} casiers`,
      description: `${lossCount} mouvement(s)`,
      icon: lossCasiers > 0 ? Trash2 : PackageX,
      className: lossCasiers > 0 ? "text-destructive" : "",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon
              className={`h-4 w-4 text-muted-foreground ${stat.className || ""}`}
            />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${stat.className || ""}`}>
              {stat.value}
            </div>
            <p className="text-xs text-muted-foreground">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

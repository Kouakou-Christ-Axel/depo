"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingDown, Calendar, Wallet } from "lucide-react";

interface ExpenseStatsData {
  thisMonth: { total: number; count: number };
  allTime: { total: number; count: number };
  byCategory: { category: string; total: number; count: number }[];
}

export function ExpenseStats() {
  const { data, isLoading } = useQuery({
    queryKey: ["expense-stats"],
    queryFn: async (): Promise<ExpenseStatsData> => {
      const res = await fetch("/api/expenses?type=stats");
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

  return (
    <div className="space-y-4">
      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Ce mois</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.thisMonth.total.toLocaleString("fr-FR")} FCFA
            </div>
            <p className="text-xs text-muted-foreground">
              {data.thisMonth.count} dépense(s)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total général</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.allTime.total.toLocaleString("fr-FR")} FCFA
            </div>
            <p className="text-xs text-muted-foreground">
              {data.allTime.count} dépense(s)
            </p>
          </CardContent>
        </Card>

        {/* Top category this month */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Top catégorie (mois)
            </CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {data.byCategory.length > 0 ? (
              <>
                <div className="text-2xl font-bold">
                  {data.byCategory[0].category}
                </div>
                <p className="text-xs text-muted-foreground">
                  {data.byCategory[0].total.toLocaleString("fr-FR")} FCFA (
                  {data.byCategory[0].count})
                </p>
              </>
            ) : (
              <p className="text-muted-foreground text-sm">Aucune dépense</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Category breakdown */}
      {data.byCategory.length > 1 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">
              Répartition par catégorie (mois en cours)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.byCategory.map((cat) => {
                const pct =
                  data.thisMonth.total > 0
                    ? (cat.total / data.thisMonth.total) * 100
                    : 0;
                return (
                  <div key={cat.category} className="flex items-center gap-3">
                    <span className="text-sm w-28 truncate font-medium">
                      {cat.category}
                    </span>
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-sm text-muted-foreground w-32 text-right">
                      {cat.total.toLocaleString("fr-FR")} FCFA
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

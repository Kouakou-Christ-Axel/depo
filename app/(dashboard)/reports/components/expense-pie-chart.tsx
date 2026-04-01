"use client";

import { Pie, PieChart, Cell } from "recharts";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";

interface ExpensePieChartProps {
  data: { category: string; total: number; pct: number }[];
}

const COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "hsl(220, 70%, 50%)",
  "hsl(160, 60%, 45%)",
  "hsl(30, 80%, 55%)",
];

export function ExpensePieChart({ data }: ExpensePieChartProps) {
  if (data.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-12">
        Aucune dépense sur cette période
      </p>
    );
  }

  const chartConfig = Object.fromEntries(
    data.map((d, i) => [
      d.category,
      {
        label: d.category,
        color: COLORS[i % COLORS.length],
      },
    ])
  ) satisfies ChartConfig;

  return (
    <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
      <PieChart>
        <ChartTooltip
          content={
            <ChartTooltipContent
              formatter={(value) =>
                `${Number(value).toLocaleString("fr-FR")} FCFA`
              }
            />
          }
        />
        <Pie
          data={data}
          dataKey="total"
          nameKey="category"
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={2}
        >
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <ChartLegend content={<ChartLegendContent nameKey="category" />} />
      </PieChart>
    </ChartContainer>
  );
}

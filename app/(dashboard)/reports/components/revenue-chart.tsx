"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";

interface RevenueChartProps {
  data: { date: string; ca: number; depenses: number }[];
}

const chartConfig = {
  ca: {
    label: "Chiffre d'affaires",
    color: "var(--chart-1)",
  },
  depenses: {
    label: "Dépenses",
    color: "var(--chart-5)",
  },
} satisfies ChartConfig;

export function RevenueChart({ data }: RevenueChartProps) {
  if (data.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-12">
        Aucune donnée sur cette période
      </p>
    );
  }

  return (
    <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
      <BarChart data={data}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="date"
          tickLine={false}
          axisLine={false}
          tickFormatter={(v: string) => {
            const d = new Date(v);
            return `${d.getDate()}/${d.getMonth() + 1}`;
          }}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tickFormatter={(v: number) =>
            v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)
          }
        />
        <ChartTooltip
          content={
            <ChartTooltipContent
              formatter={(value) =>
                `${Number(value).toLocaleString("fr-FR")} FCFA`
              }
            />
          }
        />
        <ChartLegend content={<ChartLegendContent />} />
        <Bar dataKey="ca" fill="var(--color-ca)" radius={[4, 4, 0, 0]} />
        <Bar
          dataKey="depenses"
          fill="var(--color-depenses)"
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ChartContainer>
  );
}

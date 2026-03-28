"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { ArrowUpDown, AlertTriangle, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export type ProductRow = {
  id: string;
  productName: string;
  productDescription: string | null;
  productActive: boolean;
  variantName: string;
  casierSize: number;
  sellingPriceCasier: number;
  averageCostCasier: number;
  stockHalf: number;
  alertThresholdHalf: number;
  isActive: boolean;
};

export const columns: ColumnDef<ProductRow>[] = [
  {
    accessorKey: "productName",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Produit
        <ArrowUpDown className="ml-2 h-3 w-3" />
      </Button>
    ),
    cell: ({ row }) => (
      <div>
        <span className="font-medium">{row.getValue("productName")}</span>
        {!row.original.productActive && (
          <Badge variant="secondary" className="ml-2 text-xs">
            Inactif
          </Badge>
        )}
      </div>
    ),
  },
  {
    accessorKey: "variantName",
    header: "Taille",
  },
  {
    accessorKey: "casierSize",
    header: "Casier",
    cell: ({ row }) => `${row.getValue("casierSize")} btl`,
  },
  {
    accessorKey: "sellingPriceCasier",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="w-full justify-end"
      >
        Prix/casier
        <ArrowUpDown className="ml-2 h-3 w-3" />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="text-right">
        {Number(row.getValue("sellingPriceCasier")).toLocaleString("fr-FR")}{" "}
        FCFA
      </div>
    ),
  },
  {
    accessorKey: "averageCostCasier",
    header: () => <div className="text-right">Coût moyen</div>,
    cell: ({ row }) => (
      <div className="text-right">
        {Number(row.getValue("averageCostCasier")).toLocaleString("fr-FR")} FCFA
      </div>
    ),
  },
  {
    accessorKey: "stockHalf",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="w-full justify-end"
      >
        Stock
        <ArrowUpDown className="ml-2 h-3 w-3" />
      </Button>
    ),
    cell: ({ row }) => {
      const stockHalf = row.getValue("stockHalf") as number;
      const threshold = row.original.alertThresholdHalf;
      const stockCasier = stockHalf / 2;
      const thresholdCasier = threshold / 2;
      const isLow = stockHalf <= threshold;
      const isEmpty = stockHalf === 0;

      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="text-right flex items-center justify-end gap-1.5">
              {isEmpty ? (
                <AlertTriangle className="h-3.5 w-3.5 text-destructive" />
              ) : isLow ? (
                <AlertTriangle className="h-3.5 w-3.5 text-orange-500" />
              ) : (
                <ShieldCheck className="h-3.5 w-3.5 text-green-600" />
              )}
              <span
                className={
                  isEmpty
                    ? "text-destructive font-bold"
                    : isLow
                      ? "text-orange-500 font-medium"
                      : ""
                }
              >
                {stockCasier.toFixed(1)}
              </span>
              <span className="text-muted-foreground text-xs">casiers</span>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>
              Stock : {stockCasier.toFixed(1)} casiers
              <br />
              Seuil de sécurité : {thresholdCasier.toFixed(1)} casiers
              <br />
              {isEmpty
                ? "Rupture de stock !"
                : isLow
                  ? "Stock en dessous du seuil de sécurité"
                  : "Stock suffisant"}
            </p>
          </TooltipContent>
        </Tooltip>
      );
    },
  },
  {
    accessorKey: "alertThresholdHalf",
    header: () => <div className="text-right">Seuil sécurité</div>,
    cell: ({ row }) => {
      const threshold = row.getValue("alertThresholdHalf") as number;
      return (
        <div className="text-right text-muted-foreground">
          {(threshold / 2).toFixed(1)} casiers
        </div>
      );
    },
  },
  {
    accessorKey: "isActive",
    header: () => <div className="text-right">Statut</div>,
    cell: ({ row }) => (
      <div className="text-right">
        <Badge variant={row.getValue("isActive") ? "default" : "secondary"}>
          {row.getValue("isActive") ? "Actif" : "Inactif"}
        </Badge>
      </div>
    ),
  },
];

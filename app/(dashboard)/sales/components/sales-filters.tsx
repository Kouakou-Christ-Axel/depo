"use client";

import { memo } from "react";
import { Input } from "@/components/ui/input";
import { SALE_STATUS } from "@/lib/constants";

interface SalesFiltersProps {
  search: string;
  status: string;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
}

const statusLabels: Record<string, string> = {
  PAID: "Payée",
  UNPAID: "Impayée",
  PARTIAL: "Partielle",
  CANCELLED: "Annulée",
};

export const SalesFilters = memo(function SalesFilters({
  search,
  status,
  onSearchChange,
  onStatusChange,
}: SalesFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <Input
        placeholder="Rechercher par n° vente ou client..."
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        className="max-w-sm"
      />
      <select
        className="flex h-9 w-full sm:w-48 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs"
        value={status}
        onChange={(e) => onStatusChange(e.target.value)}
      >
        <option value="">Tous les statuts</option>
        {Object.values(SALE_STATUS).map((s) => (
          <option key={s} value={s}>
            {statusLabels[s] || s}
          </option>
        ))}
      </select>
    </div>
  );
});

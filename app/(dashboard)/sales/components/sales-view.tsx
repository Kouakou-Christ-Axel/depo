"use client";

import { useCallback } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useSalesFilters } from "../hooks/use-sales-filters";
import { useSalesQuery } from "../hooks/use-sales-query";
import { SalesFilters } from "./sales-filters";
import { SalesTable } from "./sales-table";
import { SalesPagination } from "./sales-pagination";

export function SalesView() {
  const { page, setPage, search, setSearch, status, setStatus } =
    useSalesFilters();

  const { data, isLoading } = useSalesQuery({ page, search, status });

  const handleSearchChange = useCallback(
    (value: string) => {
      setSearch(value || null);
      setPage(1);
    },
    [setSearch, setPage]
  );

  const handleStatusChange = useCallback(
    (value: string) => {
      setStatus(value || null);
      setPage(1);
    },
    [setStatus, setPage]
  );

  const handlePageChange = useCallback(
    (newPage: number) => {
      setPage(newPage);
    },
    [setPage]
  );

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex gap-3">
          <Skeleton className="h-9 w-64" />
          <Skeleton className="h-9 w-48" />
        </div>
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <SalesFilters
        search={search}
        status={status}
        onSearchChange={handleSearchChange}
        onStatusChange={handleStatusChange}
      />
      <SalesTable
        data={data?.rows ?? []}
        totalPages={data?.totalPages ?? 0}
      />
      <SalesPagination
        page={page}
        totalPages={data?.totalPages ?? 1}
        total={data?.total ?? 0}
        onPageChange={handlePageChange}
      />
    </div>
  );
}

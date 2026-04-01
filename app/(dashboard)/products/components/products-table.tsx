"use client";

import { useQuery } from "@tanstack/react-query";
import { DataTable } from "@/components/ui/data-table";
import { columns, type ProductRow } from "./columns";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductDetailDialog } from "./product-detail-dialog";
import { useState, useMemo } from "react";

async function fetchProducts(): Promise<ProductRow[]> {
  const res = await fetch("/api/products?includeInactive=true");
  if (!res.ok) throw new Error("Erreur lors du chargement des produits");

  const products = await res.json();

  return products.flatMap(
    (product: {
      id: string;
      name: string;
      description: string | null;
      isActive: boolean;
      variants: {
        id: string;
        casierSize: number;
        sellingPriceCasier: number | string;
        averageCostCasier: number | string;
        stockHalf: number;
        alertThresholdHalf: number;
        isActive: boolean;
        variant: { name: string };
      }[];
    }) =>
      product.variants.length > 0
        ? product.variants.map((pv) => ({
            id: pv.id,
            productName: product.name,
            productDescription: product.description,
            productActive: product.isActive,
            variantName: pv.variant.name,
            casierSize: pv.casierSize,
            sellingPriceCasier: Number(pv.sellingPriceCasier),
            averageCostCasier: Number(pv.averageCostCasier),
            stockHalf: pv.stockHalf,
            alertThresholdHalf: pv.alertThresholdHalf,
            isActive: pv.isActive,
          }))
        : [
            {
              id: product.id,
              productName: product.name,
              productDescription: product.description,
              productActive: product.isActive,
              variantName: "—",
              casierSize: 0,
              sellingPriceCasier: 0,
              averageCostCasier: 0,
              stockHalf: 0,
              alertThresholdHalf: 0,
              isActive: product.isActive,
            },
          ]
  );
}

export function ProductsTable() {
  const { data, isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: fetchProducts,
  });

  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);

  const productRows = useMemo(() => {
    if (!selectedProduct || !data) return [];
    return data.filter((r) => r.productName === selectedProduct);
  }, [selectedProduct, data]);

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  return (
    <>
      <DataTable
        columns={columns}
        data={data ?? []}
        searchKey="productName"
        searchPlaceholder="Rechercher un produit..."
        onRowClick={(row) => setSelectedProduct(row.productName)}
      />
      <ProductDetailDialog
        productName={selectedProduct}
        rows={productRows}
        open={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </>
  );
}

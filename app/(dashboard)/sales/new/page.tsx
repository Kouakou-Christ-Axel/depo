import { listProductVariants } from '@/features/products/service';
import { listClients } from '@/features/clients/service';
import { SaleForm } from '@/features/sales/components/SaleForm';

/**
 * Page de création de vente
 * Utilise Server Components pour charger les données
 */
export default async function NewSalePage() {
  // Charger les données nécessaires côté serveur
  const [productVariants, clients] = await Promise.all([
    listProductVariants(),
    listClients(),
  ]);

  // Transformer pour le formulaire
  const formattedVariants = productVariants.map((pv) => ({
    id: pv.id,
    product: { name: pv.product.name },
    variant: { name: pv.variant.name },
    sellingPriceCasier: Number(pv.sellingPriceCasier),
    stockHalf: pv.stockHalf,
  }));

  const formattedClients = clients.map((c) => ({
    id: c.id,
    name: c.name,
  }));

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Nouvelle Vente</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <SaleForm
          productVariants={formattedVariants}
          clients={formattedClients}
        />
      </div>
    </div>
  );
}

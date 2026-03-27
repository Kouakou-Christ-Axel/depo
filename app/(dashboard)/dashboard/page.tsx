import { listProducts } from '@/features/products/service';
import { getDashboard } from '@/features/reports/service';

/**
 * Exemple de page Dashboard utilisant les Server Components
 * Les données sont fetched directement via les services
 */
export default async function DashboardPage() {
  // Appel direct au service depuis un Server Component
  const [products, dashboard] = await Promise.all([
    listProducts(),
    getDashboard(),
  ]);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Tableau de Bord</h1>

      {/* Stats du mois */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard
          title="Ventes du mois"
          value={`${dashboard.salesThisMonth.totalSales.toLocaleString()} FCFA`}
          subtitle={`${dashboard.salesThisMonth.salesCount} ventes`}
        />
        <StatCard
          title="Stock total"
          value={`${dashboard.stock.totalValue.toLocaleString()} FCFA`}
          subtitle={`${dashboard.stock.totalProducts} produits`}
        />
        <StatCard
          title="Dettes clients"
          value={`${dashboard.debts.totalDebt.toLocaleString()} FCFA`}
          subtitle={`${dashboard.debts.clientsWithDebt} clients`}
        />
      </div>

      {/* Liste des produits */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Produits</h2>
        <div className="space-y-2">
          {products.map((product) => (
            <div key={product.id} className="border-b pb-2 last:border-b-0">
              <div className="font-medium">{product.name}</div>
              <div className="text-sm text-gray-600">
                {product.variants.length} variante(s)
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  subtitle,
}: {
  title: string;
  value: string;
  subtitle: string;
}) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="text-sm text-gray-600 mb-2">{title}</div>
      <div className="text-2xl font-bold mb-1">{value}</div>
      <div className="text-xs text-gray-500">{subtitle}</div>
    </div>
  );
}

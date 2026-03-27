'use client';

import { useState } from 'react';
import { createSaleAction } from '@/features/sales/actions/createSale.action';
import { useRouter } from 'next/navigation';

/**
 * Exemple de formulaire de vente utilisant Server Actions
 */
export function SaleForm({
  productVariants,
  clients,
}: {
  productVariants: Array<{
    id: string;
    product: { name: string };
    variant: { name: string };
    sellingPriceCasier: number;
    stockHalf: number;
  }>;
  clients: Array<{ id: string; name: string }>;
}) {
  const router = useRouter();
  const [items, setItems] = useState<
    Array<{ productVariantId: string; quantityHalf: number }>
  >([]);
  const [clientId, setClientId] = useState<string>('');
  const [amountPaid, setAmountPaid] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const addItem = () => {
    setItems([...items, { productVariantId: '', quantityHalf: 1 }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (
    index: number,
    field: 'productVariantId' | 'quantityHalf',
    value: string | number
  ) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const calculateTotal = () => {
    return items.reduce((total, item) => {
      const pv = productVariants.find((p) => p.id === item.productVariantId);
      if (!pv) return total;
      const pricePerHalf = Number(pv.sellingPriceCasier) / 2;
      return total + pricePerHalf * item.quantityHalf;
    }, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const result = await createSaleAction({
        items,
        clientId: clientId || undefined,
        amountPaid,
      });

      if (result.success) {
        alert('Vente créée avec succès !');
        router.push('/sales');
        router.refresh();
      } else {
        setError(result.error || 'Erreur inconnue');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setIsLoading(false);
    }
  };

  const total = calculateTotal();

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Client (optionnel) */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Client (optionnel)
        </label>
        <select
          value={clientId}
          onChange={(e) => setClientId(e.target.value)}
          className="w-full border rounded px-3 py-2"
        >
          <option value="">Vente au comptant</option>
          {clients.map((client) => (
            <option key={client.id} value={client.id}>
              {client.name}
            </option>
          ))}
        </select>
      </div>

      {/* Articles */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <label className="block text-sm font-medium">Articles</label>
          <button
            type="button"
            onClick={addItem}
            className="bg-blue-500 text-white px-3 py-1 rounded text-sm"
          >
            + Ajouter un article
          </button>
        </div>

        {items.length === 0 && (
          <div className="text-gray-500 text-center py-4">
            Aucun article ajouté
          </div>
        )}

        <div className="space-y-3">
          {items.map((item, index) => {
            const pv = productVariants.find(
              (p) => p.id === item.productVariantId
            );
            const pricePerHalf = pv ? Number(pv.sellingPriceCasier) / 2 : 0;
            const subtotal = pricePerHalf * item.quantityHalf;

            return (
              <div
                key={index}
                className="flex gap-3 items-center border p-3 rounded"
              >
                <div className="flex-1">
                  <select
                    value={item.productVariantId}
                    onChange={(e) =>
                      updateItem(index, 'productVariantId', e.target.value)
                    }
                    className="w-full border rounded px-2 py-1"
                    required
                  >
                    <option value="">Sélectionner un produit</option>
                    {productVariants.map((pv) => (
                      <option key={pv.id} value={pv.id}>
                        {pv.product.name} - {pv.variant.name} (Stock:{' '}
                        {pv.stockHalf} demi-casiers)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="w-32">
                  <input
                    type="number"
                    min="1"
                    value={item.quantityHalf}
                    onChange={(e) =>
                      updateItem(
                        index,
                        'quantityHalf',
                        parseInt(e.target.value)
                      )
                    }
                    placeholder="Quantité"
                    className="w-full border rounded px-2 py-1"
                    required
                  />
                  <div className="text-xs text-gray-500 mt-1">demi-casiers</div>
                </div>

                <div className="w-32 text-right">
                  <div className="font-medium">
                    {subtotal.toLocaleString()} FCFA
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  ✕
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Total */}
      <div className="bg-gray-50 p-4 rounded">
        <div className="flex justify-between text-lg font-bold">
          <span>Total</span>
          <span>{total.toLocaleString()} FCFA</span>
        </div>
      </div>

      {/* Montant payé */}
      <div>
        <label className="block text-sm font-medium mb-2">Montant payé</label>
        <input
          type="number"
          min="0"
          step="0.01"
          value={amountPaid}
          onChange={(e) => setAmountPaid(parseFloat(e.target.value) || 0)}
          className="w-full border rounded px-3 py-2"
        />
        <div className="text-sm text-gray-600 mt-1">
          Reste à payer: {(total - amountPaid).toLocaleString()} FCFA
        </div>
      </div>

      {/* Bouton submit */}
      <button
        type="submit"
        disabled={isLoading || items.length === 0}
        className="w-full bg-green-600 text-white py-3 rounded font-medium hover:bg-green-700 disabled:bg-gray-400"
      >
        {isLoading ? 'Création en cours...' : 'Créer la vente'}
      </button>
    </form>
  );
}

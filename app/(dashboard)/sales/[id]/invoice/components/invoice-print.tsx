'use client';

import { Button } from '@/components/ui/button';
import { ArrowLeft, Printer } from 'lucide-react';
import Link from 'next/link';
import { useRef } from 'react';

interface SaleData {
  id: string;
  saleNumber: string;
  status: string;
  totalAmount: number;
  amountPaid: number;
  notes: string | null;
  createdAt: string;
  client: { id: string; name: string; phone: string | null } | null;
  createdBy: { id: string; name: string | null; email: string };
  items: {
    id: string;
    productName: string;
    variantName: string;
    quantityHalf: number;
    unitPrice: number;
    subtotal: number;
  }[];
}

const statusLabels: Record<string, string> = {
  PAID: 'Payée',
  UNPAID: 'Impayée',
  PARTIAL: 'Partiellement payée',
  CANCELLED: 'Annulée',
};

export function InvoicePrint({ sale }: { sale: SaleData }) {
  const contentRef = useRef<HTMLDivElement>(null);

  const date = new Date(sale.createdAt).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
  const remaining = sale.totalAmount - sale.amountPaid;

  function handlePrint() {
    const el = contentRef.current;
    if (!el) return;

    const win = window.open('', '_blank', 'width=800,height=900');
    if (!win) return;

    const html = `<!DOCTYPE html>
<html lang="fr">
<head><title>Facture ${sale.saleNumber}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box
    }

    body {
      font-family: system-ui, -apple-system, sans-serif;
      padding: 40px;
      color: #111;
      max-width: 700px;
      margin: 0 auto
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 32px
    }

    .brand {
      font-size: 24px;
      font-weight: bold
    }

    .brand-sub {
      font-size: 12px;
      color: #666
    }

    .inv-title {
      font-size: 18px;
      font-weight: bold;
      text-align: right
    }

    .inv-num {
      font-family: monospace;
      font-size: 13px
    }

    .inv-date {
      font-size: 13px;
      color: #666
    }

    .client-box {
      background: #f8f8f8;
      padding: 16px;
      border-radius: 8px;
      margin-bottom: 24px
    }

    .client-label {
      font-size: 11px;
      text-transform: uppercase;
      color: #999;
      letter-spacing: 0.5px;
      margin-bottom: 4px
    }

    .client-name {
      font-weight: 600
    }

    .client-phone {
      font-size: 13px;
      color: #666
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 24px;
      font-size: 13px
    }

    th {
      text-align: left;
      padding: 8px 4px;
      border-bottom: 2px solid #222;
      font-weight: 600
    }

    th.r {
      text-align: right
    }

    td {
      padding: 8px 4px;
      border-bottom: 1px dashed #ddd
    }

    td.r {
      text-align: right
    }

    td.bold {
      font-weight: 600
    }

    .totals {
      display: flex;
      justify-content: flex-end
    }

    .totals-box {
      width: 250px
    }

    .total-row {
      display: flex;
      justify-content: space-between;
      padding: 4px 0;
      font-size: 13px
    }

    .total-row.main {
      font-weight: bold;
      font-size: 15px
    }

    .total-row.due {
      color: #dc2626;
      font-weight: 600;
      border-top: 1px solid #ddd;
      padding-top: 8px;
      margin-top: 4px
    }

    .total-row.status {
      font-size: 11px;
      color: #666;
      border-top: 1px solid #ddd;
      padding-top: 8px;
      margin-top: 4px
    }

    .notes {
      margin-top: 24px;
      padding: 12px;
      border: 1px solid #ddd;
      border-radius: 6px;
      font-size: 13px
    }

    .notes-label {
      font-size: 11px;
      text-transform: uppercase;
      color: #999;
      margin-bottom: 4px
    }

    .footer {
      margin-top: 32px;
      padding-top: 16px;
      border-top: 1px solid #ddd;
      text-align: center;
      font-size: 11px;
      color: #999
    }

    @media print {
      body {
        padding: 20px
      }
    }
  </style>
</head>
<body>
<div class="header">
  <div>
    <div class="brand">DEPO</div>
    <div class="brand-sub">Dépôt de boissons</div>
  </div>
  <div>
    <div class="inv-title">FACTURE</div>
    <div class="inv-num">${sale.saleNumber}</div>
    <div class="inv-date">${date}</div>
  </div>
</div>
<div class="client-box">
  <div class="client-label">Client</div>
  <div class="client-name">${sale.client?.name || 'Vente comptoir'}</div>
  ${sale.client?.phone ? `<div class="client-phone">${sale.client.phone}</div>` : ''}
</div>
<table>
  <thead>
  <tr>
    <th>Produit</th>
    <th class="r">Qté (casiers)</th>
    <th class="r">Prix/casier</th>
    <th class="r">Sous-total</th>
  </tr>
  </thead>
  <tbody>
  ${sale.items
    .map(
      (item) => `<tr>
        <td>${item.productName} <span style="color:#666">${item.variantName}</span></td>
        <td class="r">${(item.quantityHalf / 2).toFixed(1)}</td>
        <td class="r">${(item.unitPrice * 2).toLocaleString('fr-FR')} FCFA</td>
        <td class="r bold">${item.subtotal.toLocaleString('fr-FR')} FCFA</td>
      </tr>`
    )
    .join('')}
  </tbody>
</table>
<div class="totals">
  <div class="totals-box">
    <div class="total-row main"><span>Total</span><span>${sale.totalAmount.toLocaleString('fr-FR')} FCFA</span></div>
    <div class="total-row"><span>Payé</span><span>${sale.amountPaid.toLocaleString('fr-FR')} FCFA</span></div>
    ${remaining > 0 ? `<div class="total-row due"><span>Reste à payer</span><span>${remaining.toLocaleString('fr-FR')} FCFA</span></div>` : ''}
    <div class="total-row status"><span>Statut</span><span>${statusLabels[sale.status] || sale.status}</span></div>
  </div>
</div>
${sale.notes ? `<div class="notes"><div class="notes-label">Notes</div><div>${sale.notes}</div></div>` : ''}
<div class="footer">
  <div>Vendeur : ${sale.createdBy.name || sale.createdBy.email}</div>
  <div style="margin-top:4px">Merci pour votre confiance</div>
</div>
<script>window.print();<\/script>
</body>
</html>`;

    win.document.open();
    win.document.body.innerHTML = html;
    win.document.close();
  }

  return (
    <div className="p-6">
      {/* Actions */}
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/sales">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-xl font-bold flex-1">Facture {sale.saleNumber}</h1>
        <Button onClick={handlePrint}>
          <Printer className="mr-2 h-4 w-4" />
          Imprimer
        </Button>
      </div>

      {/* Invoice preview */}
      <div
        ref={contentRef}
        className="max-w-[700px] mx-auto bg-white p-8 border rounded-lg"
      >
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h2 className="text-2xl font-bold">DEPO</h2>
            <p className="text-sm text-muted-foreground">Dépôt de boissons</p>
          </div>
          <div className="text-right">
            <h3 className="text-lg font-bold">FACTURE</h3>
            <p className="font-mono text-sm">{sale.saleNumber}</p>
            <p className="text-sm text-muted-foreground">{date}</p>
          </div>
        </div>

        {/* Client */}
        <div className="mb-8 p-4 bg-muted/50 rounded-lg">
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
            Client
          </p>
          <p className="font-medium">{sale.client?.name || 'Vente comptoir'}</p>
          {sale.client?.phone && (
            <p className="text-sm text-muted-foreground">{sale.client.phone}</p>
          )}
        </div>

        {/* Items */}
        <table className="w-full mb-6 text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2 font-medium">Produit</th>
              <th className="text-right py-2 font-medium">Qté (casiers)</th>
              <th className="text-right py-2 font-medium">Prix/casier</th>
              <th className="text-right py-2 font-medium">Sous-total</th>
            </tr>
          </thead>
          <tbody>
            {sale.items.map((item) => (
              <tr key={item.id} className="border-b border-dashed">
                <td className="py-2">
                  {item.productName}{' '}
                  <span className="text-muted-foreground">
                    {item.variantName}
                  </span>
                </td>
                <td className="text-right py-2">
                  {(item.quantityHalf / 2).toFixed(1)}
                </td>
                <td className="text-right py-2">
                  {(item.unitPrice * 2).toLocaleString('fr-FR')} FCFA
                </td>
                <td className="text-right py-2 font-medium">
                  {item.subtotal.toLocaleString('fr-FR')} FCFA
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="flex justify-end">
          <div className="w-64 space-y-2">
            <div className="flex justify-between text-sm">
              <span>Total</span>
              <span className="font-bold text-base">
                {sale.totalAmount.toLocaleString('fr-FR')} FCFA
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Payé</span>
              <span>{sale.amountPaid.toLocaleString('fr-FR')} FCFA</span>
            </div>
            {remaining > 0 && (
              <div className="flex justify-between text-sm font-medium text-destructive border-t pt-2">
                <span>Reste à payer</span>
                <span>{remaining.toLocaleString('fr-FR')} FCFA</span>
              </div>
            )}
            <div className="flex justify-between text-xs text-muted-foreground border-t pt-2">
              <span>Statut</span>
              <span>{statusLabels[sale.status] || sale.status}</span>
            </div>
          </div>
        </div>

        {/* Notes */}
        {sale.notes && (
          <div className="mt-6 p-3 border rounded text-sm">
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
              Notes
            </p>
            <p>{sale.notes}</p>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 pt-4 border-t text-center text-xs text-muted-foreground">
          <p>Vendeur : {sale.createdBy.name || sale.createdBy.email}</p>
          <p className="mt-1">Merci pour votre confiance</p>
        </div>
      </div>
    </div>
  );
}

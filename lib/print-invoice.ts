export interface InvoiceData {
  saleNumber: string;
  date: string;
  clientName: string;
  clientPhone?: string | null;
  items: {
    productName: string;
    variantName: string;
    quantityHalf: number;
    unitPrice: number;
    subtotal: number;
  }[];
  totalAmount: number;
  amountPaid: number;
  status: string;
  vendeur: string;
  notes?: string | null;
}

const statusLabels: Record<string, string> = {
  PAID: "Payée",
  UNPAID: "Impayée",
  PARTIAL: "Partiellement payée",
  CANCELLED: "Annulée",
};

export function printInvoice(data: InvoiceData) {
  const remaining = data.totalAmount - data.amountPaid;
  const win = window.open("", "_blank", "width=800,height=900");
  if (!win) return;

  win.document.write(`<!DOCTYPE html><html lang="fr"><head><title>Facture ${data.saleNumber}</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:system-ui,-apple-system,sans-serif;padding:40px;color:#111;max-width:700px;margin:0 auto}
  .header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:32px}
  .brand{font-size:24px;font-weight:bold}
  .brand-sub{font-size:12px;color:#666}
  .inv-title{font-size:18px;font-weight:bold;text-align:right}
  .inv-num{font-family:monospace;font-size:13px}
  .inv-date{font-size:13px;color:#666}
  .client-box{background:#f8f8f8;padding:16px;border-radius:8px;margin-bottom:24px}
  .client-label{font-size:11px;text-transform:uppercase;color:#999;letter-spacing:0.5px;margin-bottom:4px}
  .client-name{font-weight:600}
  .client-phone{font-size:13px;color:#666}
  table{width:100%;border-collapse:collapse;margin-bottom:24px;font-size:13px}
  th{text-align:left;padding:8px 4px;border-bottom:2px solid #222;font-weight:600}
  th.r{text-align:right}
  td{padding:8px 4px;border-bottom:1px dashed #ddd}
  td.r{text-align:right}
  td.bold{font-weight:600}
  .totals{display:flex;justify-content:flex-end}
  .totals-box{width:250px}
  .total-row{display:flex;justify-content:space-between;padding:4px 0;font-size:13px}
  .total-row.main{font-weight:bold;font-size:15px}
  .total-row.due{color:#dc2626;font-weight:600;border-top:1px solid #ddd;padding-top:8px;margin-top:4px}
  .total-row.status{font-size:11px;color:#666;border-top:1px solid #ddd;padding-top:8px;margin-top:4px}
  .notes{margin-top:24px;padding:12px;border:1px solid #ddd;border-radius:6px;font-size:13px}
  .notes-label{font-size:11px;text-transform:uppercase;color:#999;margin-bottom:4px}
  .footer{margin-top:32px;padding-top:16px;border-top:1px solid #ddd;text-align:center;font-size:11px;color:#999}
</style></head><body>
  <div class="header">
    <div><div class="brand">DEPO</div><div class="brand-sub">Dépôt de boissons</div></div>
    <div><div class="inv-title">FACTURE</div><div class="inv-num">${data.saleNumber}</div><div class="inv-date">${data.date}</div></div>
  </div>
  <div class="client-box">
    <div class="client-label">Client</div>
    <div class="client-name">${data.clientName}</div>
    ${data.clientPhone ? `<div class="client-phone">${data.clientPhone}</div>` : ""}
  </div>
  <table>
    <thead><tr><th>Produit</th><th class="r">Qté (casiers)</th><th class="r">Prix/casier</th><th class="r">Sous-total</th></tr></thead>
    <tbody>${data.items.map((item) => `<tr>
      <td>${item.productName} <span style="color:#666">${item.variantName}</span></td>
      <td class="r">${(item.quantityHalf / 2).toFixed(1)}</td>
      <td class="r">${(item.unitPrice * 2).toLocaleString("fr-FR")} FCFA</td>
      <td class="r bold">${item.subtotal.toLocaleString("fr-FR")} FCFA</td>
    </tr>`).join("")}</tbody>
  </table>
  <div class="totals"><div class="totals-box">
    <div class="total-row main"><span>Total</span><span>${data.totalAmount.toLocaleString("fr-FR")} FCFA</span></div>
    <div class="total-row"><span>Payé</span><span>${data.amountPaid.toLocaleString("fr-FR")} FCFA</span></div>
    ${remaining > 0 ? `<div class="total-row due"><span>Reste à payer</span><span>${remaining.toLocaleString("fr-FR")} FCFA</span></div>` : ""}
    <div class="total-row status"><span>Statut</span><span>${statusLabels[data.status] || data.status}</span></div>
  </div></div>
  ${data.notes ? `<div class="notes"><div class="notes-label">Notes</div><div>${data.notes}</div></div>` : ""}
  <div class="footer"><div>Vendeur : ${data.vendeur}</div><div style="margin-top:4px">Merci pour votre confiance</div></div>
  <script>window.print();<\/script>
</body></html>`);
  win.document.close();
}

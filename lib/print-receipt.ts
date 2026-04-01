export function printReceipt(params: {
  receiptId: string;
  clientName: string;
  amount: number;
  method: string;
  reference?: string | null;
  date: string;
}) {
  const win = window.open("", "_blank", "width=400,height=600");
  if (!win) return;
  win.document.write(`<!DOCTYPE html><html lang="fr"><head><title>Reçu</title>
<style>
  body{font-family:sans-serif;padding:20px;max-width:350px;margin:0 auto}
  h1{font-size:18px;text-align:center;margin-bottom:4px}
  .sub{text-align:center;color:#666;font-size:12px;margin-bottom:16px}
  hr{border:none;border-top:1px dashed #ccc;margin:12px 0}
  .row{display:flex;justify-content:space-between;margin:6px 0;font-size:13px}
  .label{color:#666}
  .total{font-size:20px;font-weight:bold;text-align:center;margin:16px 0}
  .footer{text-align:center;font-size:11px;color:#999;margin-top:20px}
</style></head><body>
  <h1>DEPO</h1>
  <p class="sub">Reçu de paiement</p><hr>
  <div class="row"><span class="label">N° Reçu</span><span>${params.receiptId.slice(0, 8).toUpperCase()}</span></div>
  <div class="row"><span class="label">Date</span><span>${params.date}</span></div>
  <div class="row"><span class="label">Client</span><span>${params.clientName}</span></div>
  <div class="row"><span class="label">Méthode</span><span>${params.method}</span></div>
  ${params.reference ? `<div class="row"><span class="label">Réf.</span><span>${params.reference}</span></div>` : ""}
  <hr><div class="total">${params.amount.toLocaleString("fr-FR")} FCFA</div><hr>
  <p class="footer">Merci pour votre paiement</p>
  <script>window.print();<\/script>
</body></html>`);
  win.document.close();
}

import { gc, fmt2 } from '@/lib/data';

export default function ArPanel({ fin, db, onOpenDrawer, onExport }) {
  const lbl = fin.lbl;
  const bs  = fin.balanceSheet;

  const totalReceivables   = bs.assets.current.tradeReceivables;
  const commReceivable     = bs.assets.current.commReceivable;
  const interestReceivable = bs.assets.current.interestReceivable;

  const dbTotal   = db.ar.reduce((s, e) => s + (parseFloat(e.premium)                     || 0), 0);
  const dbBalance = db.ar.reduce((s, e) => s + (parseFloat(e.balance || e.outstandingBalance) || 0), 0);
  const dbComm    = db.ar.reduce((s, e) => s + (parseFloat(e.amount  || e.commission)     || 0), 0);

  const statusColor = { Pending: 'p-warn', Partial: 'p-blue', Collected: 'p-ok', Disputed: 'p-bad' };

  return (
    <>
      <div className="section-toolbar">
        <div className="section-toolbar-left">Receivable entries: <strong>{db.ar.length} entr{db.ar.length === 1 ? 'y' : 'ies'}</strong></div>
        <div className="toolbar-btns">
          <button className="btn-export" onClick={onExport}>⬇ Export to Excel</button>
          <button className="btn-add" onClick={() => onOpenDrawer('ar')}>＋ Add Receivable</button>
        </div>
      </div>

      <div className="infobox">Accounts Receivables — as at 31 December 2025. (GH¢)</div>

      <div className="kgrid3">
        <div className="kpi r"><div className="kl">Total receivables</div><div className="kv">{gc(totalReceivables)}</div><div className="ks">Per trial balance</div></div>
        <div className="kpi a"><div className="kl">Commission receivable</div><div className="kv">{gc(commReceivable)}</div><div className="ks">Unpaid commissions</div></div>
        <div className="kpi b"><div className="kl">Interest receivable</div><div className="kv">{gc(interestReceivable)}</div><div className="ks">Fixed deposit income</div></div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="tbl">
          <thead>
            <tr>
              <th>Date</th><th>Client</th><th>Insurer</th><th>Product</th><th>Currency</th>
              <th className="tr">FX Rate</th><th className="tr">Premium (GH¢)</th><th>Status</th>
              <th className="tr">Balance (GH¢)</th><th className="tr">Commission</th>
            </tr>
          </thead>
          <tbody>
            {db.ar.length === 0 ? (
              <tr>
                <td colSpan={10} style={{ color: 'var(--muted)', fontStyle: 'italic', fontSize: 12, padding: 16 }}>
                  No receivable entries recorded — click &ldquo;Add Receivable&rdquo; above.
                </td>
              </tr>
            ) : (
              <>
                {db.ar.map((e, i) => (
                  <tr key={i} className="new-row">
                    <td>{e.date}</td><td>{e.client}</td><td>{e.insurer || '—'}</td><td>{e.product}</td>
                    <td>{e.currency}</td>
                    <td className="tr">{e.fxrate || e.fxRate || 1}</td>
                    <td className="tr fw">{fmt2(e.premium)}</td>
                    <td>
                      <span className={`pill ${statusColor[e.status] || 'p-warn'}`}>
                        <span className="pd" />{e.status}
                      </span>
                    </td>
                    <td className="tr fw neg">{fmt2(e.balance || e.outstandingBalance)}</td>
                    <td className="tr">{fmt2(e.amount || e.commission)}</td>
                  </tr>
                ))}
                <tr style={{ fontWeight: 600, background: '#FEF2F2' }}>
                  <td colSpan={6}>TOTAL</td>
                  <td className="tr neg">{Math.round(dbTotal).toLocaleString()}</td>
                  <td></td>
                  <td className="tr neg">{Math.round(dbBalance).toLocaleString()}</td>
                  <td className="tr">{Math.round(dbComm).toLocaleString()}</td>
                </tr>
              </>
            )}
          </tbody>
        </table>
      </div>
      <div className="notebox" style={{ marginTop: 14 }}>
        Record outstanding receivables above. Collection follow-up required before audit finalisation.
      </div>
    </>
  );
}

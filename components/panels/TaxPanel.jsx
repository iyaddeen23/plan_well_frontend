import { gc } from '@/lib/data';

export default function TaxPanel({ fin }) {
  const lbl        = fin.lbl;
  const tx         = fin.tx;
  const f          = fin.f;
  const bs         = fin.balanceSheet;
  const taxPayable = bs.liabilities.taxPayable;
  const taxAssets  = bs.assets.current.taxAssets;
  const stmt       = fin.taxStatement || { cit2025: [], cit2024: [] };

  return (
    <>
      <div className="infobox">Tax Credit (CIT/WHT) — {lbl}. (GH¢)</div>

      <div className="kgrid3">
        <div className="kpi r"><div className="kl">Tax payable (TB)</div><div className="kv neg">{gc(Math.round(taxPayable * f))}</div><div className="ks">Trial balance balance</div></div>
        <div className="kpi a"><div className="kl">Tax expense (P&L)</div><div className="kv neg">{gc(tx)}</div><div className="ks">Per AFS Note 9</div></div>
        <div className="kpi b"><div className="kl">Tax assets (prepaid)</div><div className="kv">{gc(taxAssets)}</div><div className="ks">CIT &amp; WHT credits</div></div>
      </div>

      <div className="g22">
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '12px 16px', fontSize: 12.5, fontWeight: 500, borderBottom: '1px solid var(--border)' }}>
            CIT Statement 2025 — key transactions
          </div>
          <table className="tbl">
            <thead><tr><th>#</th><th>Date</th><th>Description</th><th className="tr">Debit</th><th className="tr">Balance</th></tr></thead>
            <tbody>
              {stmt.cit2025.map((r, i) => (
                <tr key={i}>
                  <td>{r.ref}</td>
                  <td>{r.date}</td>
                  <td>{r.description}</td>
                  <td className={`tr fw ${r.debit ? 'neg' : 'tm'}`}>{r.debit != null ? r.debit.toLocaleString() : '—'}</td>
                  <td className={`tr fw ${r.balance < 0 ? 'neg' : ''}`}>
                    {r.balance < 0 ? `(${Math.abs(r.balance).toFixed(2)})` : r.balance.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '12px 16px', fontSize: 12.5, fontWeight: 500, borderBottom: '1px solid var(--border)' }}>
            CIT Statement 2024 — key transactions
          </div>
          <table className="tbl">
            <thead><tr><th>#</th><th>Date</th><th>Description</th><th className="tr">Credit</th><th className="tr">Balance</th></tr></thead>
            <tbody>
              {stmt.cit2024.map((r, i) => (
                <tr key={i}>
                  <td>{r.ref}</td>
                  <td>{r.date}</td>
                  <td>{r.description}</td>
                  <td className={`tr pos`}>{r.credit != null ? r.credit.toLocaleString() : '—'}</td>
                  <td className={`tr fw ${r.balance < 0 ? 'neg' : 'pos'}`}>
                    {r.balance < 0 ? `(${Math.abs(r.balance).toLocaleString()})` : r.balance.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

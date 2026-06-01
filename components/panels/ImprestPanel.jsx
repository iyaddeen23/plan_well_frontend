import { gc, fmt2 } from '@/lib/data';

export default function ImprestPanel({ fin, db, onOpenDrawer, onExport }) {
  const lbl = fin.lbl;
  // fin.E is always available for all periods including is6 (full-year FY expenses)
  const E   = fin.E;

  const imprestKeys = ['print','comm2','util','levy','fuel','trav','rep','rent','refresh','office'];
  const total = imprestKeys.reduce((s, k) => s + (E[k] || 0), 0);

  return (
    <>
      <div className="section-toolbar">
        <div className="section-toolbar-left">Transactions: <strong>{db.imprest.length} entr{db.imprest.length === 1 ? 'y' : 'ies'}</strong></div>
        <div className="toolbar-btns">
          <button className="btn-export" onClick={onExport}>⬇ Export to Excel</button>
          <button className="btn-add" onClick={() => onOpenDrawer('imprest')}>＋ Add Transaction</button>
        </div>
      </div>

      <div className="infobox">Imprest Cash Book — {lbl}. YTD expense totals from Notes to Accounts. (GH¢)</div>

      <div className="kgrid">
        <Kpi label="Printing & stationery" value={E.print}   />
        <Kpi label="Communication"         value={E.comm2}   />
        <Kpi label="Utilities"             value={E.util}    />
        <Kpi label="Levies & Licensing"    value={E.levy}    />
      </div>
      <div className="kgrid">
        <Kpi label="Fuel & lubricants"     value={E.fuel}    />
        <Kpi label="Travel & transport"    value={E.trav}    />
        <Kpi label="Repairs & maintenance" value={E.rep}     />
        <Kpi label="Rent & occupancy"      value={E.rent}    />
      </div>
      <div className="kgrid">
        <Kpi label="Refreshments"          value={E.refresh} />
        <Kpi label="Office supplies"       value={E.office}  />
        <div className="kpi a"><div className="kl">Total imprest items</div><div className="kv neg">{gc(total)}</div></div>
        <div className="kpi r"><div className="kl">Period</div><div className="kv">{lbl}</div></div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden', marginTop: 0 }}>
        <div style={{ padding: '12px 16px', fontSize: 12.5, fontWeight: 500, borderBottom: '1px solid var(--border)' }}>Transaction log</div>
        <table className="tbl">
          <thead>
            <tr><th>Date</th><th>CHQ No.</th><th>Invoice No.</th><th>Details</th><th>Payee</th><th>Category</th><th className="tr">Amount (GH¢)</th><th>Type</th></tr>
          </thead>
          <tbody>
            {db.imprest.length === 0 ? (
              <tr><td colSpan={8} style={{ color: 'var(--muted)', fontStyle: 'italic', fontSize: 12, padding: 16 }}>No transactions recorded — click &ldquo;Add Transaction&rdquo; above.</td></tr>
            ) : db.imprest.map((e, i) => (
              <tr key={i} className="new-row">
                <td>{e.date}</td><td>{e.chq}</td><td>{e.invoice}</td><td>{e.details}</td><td>{e.payee}</td>
                <td><span className="pill p-blue"><span className="pd" />{e.category}</span></td>
                <td className={`tr tnum ${(e.txtype || e.txType) === 'receipt' ? 'pos' : 'neg'}`}>{fmt2(e.amount)}</td>
                <td>{e.txtype || e.txType}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function Kpi({ label, value }) {
  return (
    <div className="kpi">
      <div className="kl">{label}</div>
      <div className="kv neg">{gc(value)}</div>
    </div>
  );
}

import { gc, fmt2 } from '@/lib/data';

export default function BankPanel({ fin, db, onOpenDrawer, onExport }) {
  const lbl = fin.lbl;
  const E   = fin.E;
  const fc  = fin.fc;
  const bs  = fin.balanceSheet;

  const totalBank  = bs.assets.current.cashAtBank;
  const overdraft  = bs.liabilities.bankOverdraft;
  const netCash    = bs.netCashPosition;

  // Aggregate credits and debits from the db for a reconciliation footer
  const credits = db.bank.filter(e => e.txtype === 'Credit (Deposit)').reduce((s, e) => s + (parseFloat(e.ghc || e.amount) || 0), 0);
  const debits  = db.bank.filter(e => e.txtype !== 'Credit (Deposit)').reduce((s, e) => s + (parseFloat(e.ghc || e.amount) || 0), 0);

  return (
    <>
      <div className="section-toolbar">
        <div className="section-toolbar-left">Bank entries: <strong>{db.bank.length} entr{db.bank.length === 1 ? 'y' : 'ies'}</strong></div>
        <div className="toolbar-btns">
          <button className="btn-export" onClick={onExport}>⬇ Export to Excel</button>
          <button className="btn-add" onClick={() => onOpenDrawer('bank')}>＋ Add Bank Entry</button>
        </div>
      </div>

      <div className="infobox">Bank Reconciliation — {lbl}. (GH¢)</div>

      <div className="kgrid3">
        <div className="kpi"><div className="kl">Total bank balance</div><div className="kv pos">{gc(totalBank)}</div><div className="ks">All accounts</div></div>
        <div className="kpi r"><div className="kl">Bank overdraft</div><div className="kv neg">{gc(overdraft)}</div><div className="ks">Net overdraft</div></div>
        <div className="kpi a"><div className="kl">Net cash</div><div className="kv">{gc(netCash)}</div><div className="ks">Balance less overdraft</div></div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="tbl">
          <thead>
            <tr><th>Date / Account</th><th>Currency</th><th className="tr">Foreign Amt</th><th className="tr">FX Rate</th><th className="tr">GH¢ Equiv.</th><th>Notes</th></tr>
          </thead>
          <tbody>
            {db.bank.length === 0 ? (
              <tr><td colSpan={6} style={{ color: 'var(--muted)', fontStyle: 'italic', fontSize: 12, padding: 16 }}>No bank transactions recorded — click &ldquo;Add Bank Entry&rdquo; above.</td></tr>
            ) : db.bank.map((e, i) => (
              <tr key={i} className="new-row">
                <td>{e.date} — {e.account}</td>
                <td>{e.currency}</td>
                <td className="tr tnum">{fmt2(e.amount)}</td>
                <td className="tr">{e.fxrate}</td>
                <td className={`tr fw ${e.txtype === 'Credit (Deposit)' ? 'pos' : 'neg'}`}>{fmt2(e.ghc || e.amount)}</td>
                <td className="tm">{e.notes}</td>
              </tr>
            ))}
            {db.bank.length > 0 && (
              <>
                <tr style={{ fontWeight: 600, background: '#F0FDF4' }}>
                  <td colSpan={4}>NET CREDITS</td>
                  <td className="tr pos">{credits.toLocaleString()}</td>
                  <td className="tm">Recorded deposits</td>
                </tr>
                <tr style={{ background: '#FEF2F2', fontWeight: 500 }}>
                  <td colSpan={4}>NET DEBITS</td>
                  <td className="tr neg">({debits.toLocaleString()})</td>
                  <td className="tm">Withdrawals &amp; charges</td>
                </tr>
              </>
            )}
          </tbody>
        </table>
      </div>

      <div className="card" style={{ marginTop: 14 }}>
        <div className="ct">Bank-related costs <span>{lbl}</span></div>
        <div className="fr"><span>Bank charges</span><span className="neg fw">{gc(E.bank)}</span></div>
        <div className="fr"><span>Finance charges (overdraft)</span><span className="neg fw">{gc(fc)}</span></div>
        <div className="fr fw" style={{ borderTop: '2px solid var(--border)', paddingTop: 8 }}>
          <span>Total bank costs</span><span className="neg">{gc(E.bank + fc)}</span>
        </div>
      </div>
    </>
  );
}

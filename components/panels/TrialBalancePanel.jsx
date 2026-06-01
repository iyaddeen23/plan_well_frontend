import { gc } from '@/lib/data';

export default function TrialBalancePanel({ fin, db, onOpenDrawer, onExport }) {
  const lbl = fin.lbl;
  const bs  = fin.balanceSheet;

  const totalDebit  = bs.assets.total;
  const totalCredit = bs.liabilities.total + bs.equity.statedCapital + Math.abs(fin.reClose || 0);

  const dbDebit  = db.tb.reduce((s, e) => s + (parseFloat(e.debit)  || 0), 0);
  const dbCredit = db.tb.reduce((s, e) => s + (parseFloat(e.credit) || 0), 0);
  const balanced = Math.abs(dbDebit - dbCredit) < 0.01;

  return (
    <>
      <div className="section-toolbar">
        <div className="section-toolbar-left">Adjustments: <strong>{db.tb.length} entr{db.tb.length === 1 ? 'y' : 'ies'}</strong></div>
        <div className="toolbar-btns">
          <button className="btn-export" onClick={onExport}>⬇ Export All Sheets</button>
          <button className="btn-add" onClick={() => onOpenDrawer('tb')}>＋ Add Adjustment</button>
        </div>
      </div>

      <div className="infobox">Trial Balance — {lbl}. (GH¢)</div>

      <div className="g22" style={{ marginBottom: 14 }}>
        <div className="card">
          <div className="kl">Total debit balances</div>
          <div className="kv pos">{gc(totalDebit)}</div>
          <div className="ks">Assets + expense accounts</div>
        </div>
        <div className="card">
          <div className="kl">Total credit balances</div>
          <div className="kv neg">{gc(totalCredit)}</div>
          <div className="ks">Liabilities + income accounts</div>
        </div>
      </div>

      {/* Balance sheet summary */}
      <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: 14 }}>
        <div style={{ padding: '12px 16px', fontSize: 12.5, fontWeight: 500, borderBottom: '1px solid var(--border)' }}>
          Balance sheet summary
        </div>
        <table className="tbl">
          <thead>
            <tr><th>Category</th><th className="tr">Amount (GH¢)</th><th>Side</th></tr>
          </thead>
          <tbody>
            <Row label="Non-current assets"       v={bs.assets.nonCurrent.total}    side="Debit"  pos />
            <Row label="Current assets"            v={bs.assets.current.total}       side="Debit"  pos />
            <Row label="Total assets"              v={bs.assets.total}               side="Debit"  pos bold />
            <Row label="Total liabilities"         v={bs.liabilities.total}          side="Credit" neg />
            <Row label="Stated capital"            v={bs.equity.statedCapital}       side="Credit" neg />
            <Row label="Retained earnings (close)" v={Math.abs(fin.reClose || 0)}    side="Credit" neg />
          </tbody>
        </table>
      </div>

      {/* Adjustments entered by user */}
      {db.tb.length > 0 && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '12px 16px', fontSize: 11, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.06em', borderBottom: '2px solid var(--border)', background: '#FAFAF8', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Adjustments</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: balanced ? '#1D9E75' : '#DC2626' }}>
              {balanced ? '✓ Balanced' : `⚠ Off by ${gc(Math.abs(dbDebit - dbCredit))}`}
            </span>
          </div>
          <table className="tbl">
            <thead>
              <tr><th>Particulars</th><th className="tr">Debit</th><th className="tr">Credit</th><th>Period</th><th>Type</th><th>Notes</th></tr>
            </thead>
            <tbody>
              {db.tb.map((e, i) => (
                <tr key={i} className="new-row">
                  <td>{e.particulars}</td>
                  <td className="tr tnum pos">{e.debit || '—'}</td>
                  <td className="tr tnum neg">{e.credit || '—'}</td>
                  <td>{e.period}</td>
                  <td style={{ fontSize: 11 }}>{e.adjtype || e.adjType}</td>
                  <td style={{ fontSize: 11 }}>{e.notes}</td>
                </tr>
              ))}
              <tr style={{ fontWeight: 600, background: balanced ? '#F0FDF4' : '#FEF2F2' }}>
                <td>TOTALS</td>
                <td className="tr pos">{Math.round(dbDebit).toLocaleString()}</td>
                <td className="tr neg">{Math.round(dbCredit).toLocaleString()}</td>
                <td colSpan={3} style={{ color: balanced ? '#1D9E75' : '#DC2626', fontSize: 12 }}>
                  {balanced ? '✓ Debits = Credits' : `Difference: ${gc(Math.abs(dbDebit - dbCredit))}`}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {db.tb.length === 0 && (
        <div className="card" style={{ color: 'var(--muted)', fontStyle: 'italic', fontSize: 12, padding: 16 }}>
          No adjustments posted yet — click &ldquo;Add Adjustment&rdquo; to post an entry.
        </div>
      )}
    </>
  );
}

function Row({ label, v, side, pos, neg, bold }) {
  return (
    <tr>
      <td style={bold ? { fontWeight: 600 } : {}}>{label}</td>
      <td className={`tr tnum${pos ? ' pos' : neg ? ' neg' : ''}${bold ? ' fw' : ''}`}>
        {Math.round(v).toLocaleString()}
      </td>
      <td className={`tm`}>{side}</td>
    </tr>
  );
}

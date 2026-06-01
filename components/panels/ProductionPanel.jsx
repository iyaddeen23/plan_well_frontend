'use client';
import { Bar, Line } from 'react-chartjs-2';
import { gc, gcK } from '@/lib/data';

const chartOpts = (horizontal = false) => ({
  responsive: true, maintainAspectRatio: false,
  plugins: { legend: { display: true, position: 'top', labels: { font: { size: 10 }, boxWidth: 10 } } },
  scales: {
    y: { ticks: { callback: v => gcK(v), font: { size: 10 } }, grid: { color: '#F0EFE9' } },
    x: { ticks: { font: { size: 10 } }, grid: { display: false } },
  },
  ...(horizontal ? { indexAxis: 'y' } : {}),
});

export default function ProductionPanel({ fin, db, onOpenDrawer, onExport, staticInsurers }) {
  const is6 = fin.is6;
  const lbl = fin.lbl;

  // For non-is6, insurer data comes from fin (included in period response).
  // For is6, we use the separately-fetched staticInsurers reference data.
  const ins          = is6 ? staticInsurers : fin.insurers;
  const insurerNames = ins?.names        || [];
  const insVals2026  = is6 ? (ins?.values2026 || []) : (fin.insurerVals || []);
  const insVals2025  = ins?.values2025   || [];

  const comm    = is6 ? fin.d.comm[5] : fin.comm;
  const total   = insVals2026.reduce((a, b) => a + b, 0) || 1;
  const topIdx  = insVals2026.length > 0 ? insVals2026.indexOf(Math.max(...insVals2026)) : 0;
  const topName = insurerNames[topIdx] || '–';
  const topVal  = insVals2026[topIdx]  || 0;
  const f       = is6 ? 1 : fin.f;

  const prodChartData = is6
    ? { labels: fin.d.years, datasets: [{ label: 'Total Commission', data: fin.d.comm, backgroundColor: fin.d.years.map((_, i) => i === 5 ? '#1D9E75' : '#9FE1CB'), borderRadius: 4 }] }
    : { labels: insurerNames, datasets: [
        { label: lbl,           data: insVals2026,                                backgroundColor: '#1D9E75', borderRadius: 4 },
        { label: '2025 equiv.', data: insVals2025.map(v => Math.round(v * f)),    backgroundColor: '#9FE1CB', borderRadius: 4 },
      ] };

  return (
    <>
      <div className="section-toolbar">
        <div className="section-toolbar-left">New production entries: <strong>{db.production.length} entr{db.production.length === 1 ? 'y' : 'ies'}</strong></div>
        <div className="toolbar-btns">
          <button className="btn-export" onClick={onExport}>⬇ Export to Excel</button>
          <button className="btn-add" onClick={() => onOpenDrawer('production')}>＋ Add Commission Entry</button>
        </div>
      </div>

      <div className="infobox">Commission by Insurer — {lbl}. Total: {gc(comm)}. (GH¢)</div>

      <div className="kgrid3">
        <div className="kpi">
          <div className="kl">Top insurer</div>
          <div className="kv">{topName}</div>
          <div className="ks">{gc(topVal)} — {Math.round(topVal / total * 100)}%</div>
        </div>
        <div className="kpi a">
          <div className="kl">Total commission</div>
          <div className="kv">{gc(comm)}</div>
          <div className="ks">{insurerNames.length} active insurers · {lbl}</div>
        </div>
        <div className="kpi b">
          <div className="kl">vs prior year</div>
          {fin.priorYear ? (() => {
            const py2025 = fin.priorYear.comm;
            const diff   = Math.abs(comm - py2025);
            const up     = comm >= py2025;
            return (
              <>
                <div className="kv neg">{up ? '↑' : '↓'} GH¢{diff.toLocaleString()}</div>
                <div className="ks">2025 was GH¢{py2025.toLocaleString()}</div>
              </>
            );
          })() : <div className="kv tm">–</div>}
        </div>
      </div>

      <div className="g22">
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '12px 16px', fontSize: 12.5, fontWeight: 500, borderBottom: '1px solid var(--border)' }}>
            Commission {is6 ? 'trend — 6 years' : `by insurer — ${lbl}`}
          </div>
          <table className="tbl">
            <thead>
              <tr><th>Insurer</th><th className="tr">2026 (GH¢)</th><th className="tr">2025 (GH¢)</th><th className="tr">Change</th><th>Share</th></tr>
            </thead>
            <tbody>
              {insurerNames.map((name, i) => {
                const v26  = insVals2026[i] || 0;
                const v25  = insVals2025[i] || 0;
                const chg  = v26 - v25;
                const share = Math.round(v26 / total * 100);
                return (
                  <tr key={name}>
                    <td>{name}</td>
                    <td className={`tr tnum fw${v26 > 0 ? ' pos' : ''}`}>{Math.round(v26).toLocaleString()}</td>
                    <td className="tr tm">{v25.toLocaleString()}</td>
                    <td className="tr">
                      {chg >= 0
                        ? <span className="pos">↑ +{Math.round(chg).toLocaleString()}</span>
                        : <span className="neg">↓ ({Math.round(Math.abs(chg)).toLocaleString()})</span>}
                    </td>
                    <td>
                      <div className="pb"><div className="pf" style={{ width: Math.min(100, share * 2.5) + '%' }} /></div>
                    </td>
                  </tr>
                );
              })}
              {db.production.map((e, i) => (
                <tr key={`new-${i}`} className="new-row">
                  <td>{e.insurer === 'Other (specify below)' ? (e.insurerOther || 'Other') : e.insurer}</td>
                  <td className="tr tnum fw pos">{e.amount}</td>
                  <td className="tr tm">New entry</td>
                  <td className="tr pos">↑ New</td>
                  <td><div className="pb"><div className="pf" style={{ width: '10%' }} /></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="card">
          <div className="ct">
            {is6 ? 'Commission trend — 6 years' : `Top ${insurerNames.length} insurers`}
            <span>{lbl}</span>
          </div>
          <div className="cwt">
            <Bar data={prodChartData} options={chartOpts(!is6)} />
          </div>
          <div className="notebox" style={{ marginTop: 14 }}>
            Enterprise Insurance jumped 135× in 2026. Coronation dropped 94%. Review with production team.
          </div>
        </div>
      </div>
    </>
  );
}

'use client';
import { useState } from 'react';
import { Bar, Line } from 'react-chartjs-2';
import { gc, gcK } from '@/lib/data';

const chartOpts = (showLegend = true) => ({
  responsive: true, maintainAspectRatio: false,
  plugins: { legend: { display: showLegend, position: 'top', labels: { font: { size: 10 }, boxWidth: 10 } } },
  scales: {
    y: { ticks: { callback: v => gcK(v), font: { size: 10 } }, grid: { color: '#F0EFE9' } },
    x: { ticks: { font: { size: 10 } }, grid: { display: false } },
  },
});

export default function AfsPanel({ fin }) {
  const [activeTab, setActiveTab] = useState('pl');
  const is6 = fin.is6;
  const d   = is6 ? fin.d : null;
  const lbl = fin.lbl;
  const bs  = fin.balanceSheet;
  const py  = fin.priorYear; // prior-year (2025) figures from API

  const comm   = is6 ? d.comm[5] : fin.comm;
  const inv    = is6 ? d.inv[5]  : fin.inv;
  const exp    = is6 ? d.exp[5]  : fin.exp;
  const fc     = fin.fc;
  const tx     = fin.tx;
  const opLoss = comm - exp;
  const pbit   = opLoss + inv;
  const pbt    = pbit - fc;
  const pat    = is6 ? d.net[5] : fin.pat;
  const reOpen  = bs.equity.retainedOpen;
  const reClose = is6 ? (reOpen + d.net[5]) : fin.reClose;

  const totalEquity     = bs.equity.statedCapital + reClose;
  const totalLiabEquity = bs.liabilities.total + totalEquity;

  const afsChartData = is6
    ? { labels: d.years, datasets: [
        { label: 'Commission', data: d.comm, borderColor: '#1D9E75', backgroundColor: 'rgba(29,158,117,.12)', fill: true, tension: 0.3 },
        { label: 'Investment', data: d.inv,  borderColor: '#FAC775', backgroundColor: 'rgba(250,199,117,.12)', fill: true, tension: 0.3 },
        { label: 'Net Profit', data: d.net,  borderColor: '#185FA5', backgroundColor: 'rgba(24,95,165,.1)',   fill: true, tension: 0.3 },
      ] }
    : { labels: ['Commission', 'G&A Exp', 'Inv Income', 'Finance Cost', 'Tax'],
        datasets: [
          { label: lbl, data: [comm, exp, inv, fc, tx], backgroundColor: '#1D9E75', borderRadius: 3 },
          ...(py ? [{ label: 'FY 2025', data: [py.comm, py.exp, py.inv, py.fc, py.tx], backgroundColor: '#9FE1CB', borderRadius: 3 }] : []),
        ] };

  const Num = ({ v, isNeg }) => {
    if (isNeg !== undefined) {
      return isNeg ? <span className="neg">{v < 0 ? `(${gc(Math.abs(v)).replace('GH¢','')})` : gc(v).replace('GH¢','')}</span>
                   : <span className="pos">{gc(v).replace('GH¢','')}</span>;
    }
    return v >= 0
      ? <span className="pos fw">{gc(v).replace('GH¢','')}</span>
      : <span className="neg fw">({gc(Math.abs(v)).replace('GH¢','')})</span>;
  };

  return (
    <>
      <div className="tabs">
        <button className={`tab${activeTab === 'pl' ? ' active' : ''}`} onClick={() => setActiveTab('pl')}>P&amp;L &amp; Retained Earnings</button>
        <button className={`tab${activeTab === 'bs' ? ' active' : ''}`} onClick={() => setActiveTab('bs')}>Statement of Financial Position</button>
      </div>

      {activeTab === 'pl' && (
        <>
          <div className="infobox">PLANWELL INSURANCE BROKERS LIMITED — Statement of Profit or Loss · {lbl}. (All amounts in GH¢)</div>
          <div className="g22">
            <div className="card">
              <div className="ct">Income statement <span>Note | {lbl}</span></div>
              <div className="frs">Revenue</div>
              <div className="fr"><span>Commission revenue</span><span><span className="tm">Note 5 </span><span className="pos fw">{gc(comm).replace('GH¢','')}</span></span></div>
              <div className="fr"><span>Gross profit</span><span className="pos fw">{gc(comm).replace('GH¢','')}</span></div>
              <div className="fr"><span>G&amp;A expenses</span><span><span className="tm">Note 6 </span><span className="neg">({gc(exp).replace('GH¢','')})</span></span></div>
              <div className="fr fw"><span>Operating profit/(loss)</span><Num v={opLoss} /></div>
              <div className="fr"><span>Investment income</span><span><span className="tm">Note 7 </span><span className="pos">{gc(inv).replace('GH¢','')}</span></span></div>
              <div className="fr fw"><span>PBIT</span><Num v={pbit} /></div>
              <div className="fr"><span>Finance cost</span><span><span className="tm">Note 8 </span><span className="neg">({gc(fc).replace('GH¢','')})</span></span></div>
              <div className="fr fw"><span>Profit/(loss) before tax</span><Num v={pbt} /></div>
              <div className="fr"><span>Tax expense</span><span><span className="tm">Note 9 </span><span className="neg">({gc(tx).replace('GH¢','')})</span></span></div>
              <div className="fr fw" style={{ borderTop: '2px solid var(--border)', paddingTop: 8 }}>
                <span>Profit/(loss) after tax</span><Num v={pat} />
              </div>
              <div className="frs">Retained Earnings</div>
              <div className="fr"><span>Opening retained earnings</span><span className="neg">({gc(Math.abs(reOpen)).replace('GH¢','')})</span></div>
              <div className="fr fw"><span>Closing retained earnings</span><span className="neg">({gc(Math.abs(reClose)).replace('GH¢','')})</span></div>
            </div>
            <div className="card">
              <div className="ct">P&amp;L chart <span>{lbl} vs {py ? 'FY 2025' : 'Prior Year'}</span></div>
              <div className="cw">
                {is6 ? <Line data={afsChartData} options={chartOpts(true)} /> : <Bar data={afsChartData} options={chartOpts(true)} />}
              </div>
              <div className="notebox" style={{ marginTop: 14 }}>
                {pat < 0
                  ? `Loss after tax ${gc(Math.abs(pat))} this period. Exchange loss ${gc(fin.exch)} and depreciation ${gc(fin.E?.dep ?? 0)} were key cost drivers.`
                  : `Profit after tax ${gc(pat)} this period.`}
              </div>
            </div>
          </div>
        </>
      )}

      {activeTab === 'bs' && (
        <>
          <div className="infobox">Statement of Financial Position as at 31st December, 2026.</div>
          <div className="g22">
            <div className="card">
              <div className="ct">Assets</div>
              <div className="frs">Non-Current Assets</div>
              <div className="fr"><span>PP&amp;E (net)</span><span className="fw">{bs.assets.nonCurrent.ppe.toLocaleString()}</span></div>
              <div className="fr"><span>Intangibles (net)</span><span className="fw">{bs.assets.nonCurrent.intangibles.toLocaleString()}</span></div>
              <div className="fr fw"><span>Total non-current assets</span><span>{bs.assets.nonCurrent.total.toLocaleString()}</span></div>
              <div className="frs">Current Assets</div>
              <div className="fr"><span>Prepayment (rent)</span><span className="fw">{bs.assets.current.rentPrepaid.toLocaleString()}</span></div>
              <div className="fr"><span>Trade &amp; receivables</span><span className="fw">{bs.assets.current.tradeReceivables.toLocaleString()}</span></div>
              <div className="fr"><span>Deferred tax assets</span><span className="fw">{bs.assets.current.deferredTax.toLocaleString()}</span></div>
              <div className="fr"><span>Cash &amp; equivalents</span><span className="pos fw">{bs.assets.current.cashAtBank.toLocaleString()}</span></div>
              <div className="fr fw"><span>Total current assets</span><span className="pos">{bs.assets.current.total.toLocaleString()}</span></div>
              <div className="fr fw" style={{ borderTop: '2px solid var(--border)', paddingTop: 8 }}>
                <span>TOTAL ASSETS</span><span className="fw">{bs.assets.total.toLocaleString()}</span>
              </div>
            </div>
            <div className="card">
              <div className="ct">Liabilities &amp; Equity</div>
              <div className="frs">Current Liabilities</div>
              <div className="fr"><span>Bank overdrafts &amp; loans</span><span className="neg fw">{bs.liabilities.bankOverdraft.toLocaleString()}</span></div>
              <div className="fr"><span>Trade creditors</span><span className="neg fw">{bs.liabilities.tradeCreditors.toLocaleString()}</span></div>
              <div className="fr"><span>Accrual liabilities</span><span className="neg fw">{bs.liabilities.accruals.toLocaleString()}</span></div>
              <div className="fr"><span>Income tax payable</span><span className="neg fw">{bs.liabilities.taxPayable.toLocaleString()}</span></div>
              <div className="fr"><span>Other payables</span><span className="neg fw">{bs.liabilities.otherPayables.toLocaleString()}</span></div>
              <div className="fr fw"><span>Total liabilities</span><span className="neg">{bs.liabilities.total.toLocaleString()}</span></div>
              <div className="frs">Equity</div>
              <div className="fr"><span>Stated capital</span><span className="pos fw">{bs.equity.statedCapital.toLocaleString()}</span></div>
              <div className="fr"><span>Retained earnings</span><span className="neg fw">({gc(Math.abs(reClose)).replace('GH¢','')})</span></div>
              <div className="fr fw"><span>Total equity</span><span className={totalEquity >= 0 ? 'pos' : 'neg'}>{totalEquity >= 0 ? totalEquity.toLocaleString() : `(${Math.abs(totalEquity).toLocaleString()})`}</span></div>
              <div className="fr fw" style={{ borderTop: '2px solid var(--border)', paddingTop: 8 }}>
                <span>TOTAL L&amp;E</span><span className="fw">{totalLiabEquity.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}

'use client';
import { Bar } from 'react-chartjs-2';
import { gc, gcK } from '@/lib/data';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const chartOpts = {
  responsive: true, maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    y: { ticks: { callback: v => gcK(v), font: { size: 10 } }, grid: { color: '#F0EFE9' } },
    x: { ticks: { font: { size: 10 } }, grid: { display: false } },
  },
};

export default function LoanPanel({ fin }) {
  const is6 = fin.is6;
  const p   = fin.p;

  const loan         = fin.loanDetails  || {};
  const loanSchedule = fin.loanSchedule || [];
  const history      = fin.loanHistory  || { years: [], accruedInterest: [] };

  const principal      = loan.principal      ?? null;
  const annualRate     = loan.annualRatePct  ?? null;
  const monthlyRate    = loan.monthlyRatePct ? loan.monthlyRatePct.toFixed(3) : null;
  const penaltyRate    = loan.penaltyPct     ?? null;
  const openingAccrued = loanSchedule[0]     ?? null;

  const showMonths = p === 'q1' ? [0,1,2] : p === 'q2' ? [3,4,5] : p === 'q3' ? [6,7,8] : p === 'q4' ? [9,10,11] : MONTHS.map((_,i) => i);

  const loanChartData = {
    labels:   [...history.years, '2026'],
    datasets: [{
      label:           'Accrued Interest',
      data:            [...history.accruedInterest, openingAccrued ?? 0],
      backgroundColor: history.years.map(() => '#DC2626').concat(['#FAC775']),
      borderRadius:    4,
    }],
  };

  return (
    <>
      <div className="infobox">
        Loan Schedule —
        {principal != null ? ` ${gc(principal)} original loan` : ''}
        {annualRate != null ? ` at ${annualRate}% p.a.` : ''}
        {penaltyRate != null ? ` · Penalty: ${penaltyRate}%/month.` : ''}
        {openingAccrued != null ? ` Accrued interest Dec 2025: ${gc(openingAccrued)}.` : ''}
        {' '}(GH¢)
      </div>

      <div className="kgrid">
        <div className="kpi r"><div className="kl">Original loan</div><div className="kv">{principal != null ? gc(principal) : '–'}</div><div className="ks">Principal ({loan.startYear ?? '–'})</div></div>
        <div className="kpi a"><div className="kl">Annual rate</div><div className="kv">{annualRate != null ? annualRate + '%' : '–'}</div><div className="ks">{monthlyRate != null ? `Monthly: ${monthlyRate}%` : '–'}</div></div>
        <div className="kpi"><div className="kl">Accrued interest (Dec 2025)</div><div className="kv neg">{openingAccrued != null ? gc(openingAccrued) : '–'}</div><div className="ks">Carried to 2026</div></div>
        <div className="kpi b"><div className="kl">Penalty rate</div><div className="kv">{penaltyRate != null ? penaltyRate + '%/month' : '–'}</div><div className="ks">On overdue payments</div></div>
      </div>

      <div className="g22">
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '12px 16px', fontSize: 12.5, fontWeight: 500, borderBottom: '1px solid var(--border)' }}>
            2026 monthly accrual — {is6 || p === 'fy' ? 'Full Year' : 'Quarter shown'}
          </div>
          <table className="tbl">
            <thead>
              <tr><th>Month</th><th className="tr">Opening Accrued Int.</th><th className="tr">Penalty ({penaltyRate ?? '–'}%)</th><th className="tr">Closing</th></tr>
            </thead>
            <tbody>
              {loanSchedule.length === 0 ? (
                <tr><td colSpan={4} style={{ color: 'var(--muted)', fontStyle: 'italic', fontSize: 12, padding: 16 }}>No loan schedule data available.</td></tr>
              ) : showMonths.map(i => {
                const open = loanSchedule[i] ?? 0;
                const penalty = penaltyRate ?? 2;
                return (
                  <tr key={i}>
                    <td>{MONTHS[i]} 2026</td>
                    <td className="tr tnum">{open.toLocaleString()}</td>
                    <td className="tr neg">{Math.round(open * penalty / 100).toLocaleString()}</td>
                    <td className="tr fw neg">{Math.round(open * (1 + penalty / 100)).toLocaleString()}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="card">
          <div className="ct">Historical accrued interest by year</div>
          <div className="cws">
            {history.years.length > 0
              ? <Bar data={loanChartData} options={chartOpts} />
              : <div style={{ color: 'var(--muted)', fontStyle: 'italic', fontSize: 12, padding: 16 }}>No historical data available.</div>}
          </div>
          <div className="notebox" style={{ marginTop: 12 }}>
            <strong>⚠ Critical:</strong> Loan unpaid since {loan.startYear ?? '–'}. Penalty interest exceeds original principal 2.5×. Board resolution required.
          </div>
        </div>
      </div>
    </>
  );
}

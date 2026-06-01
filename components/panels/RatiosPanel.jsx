'use client';
import { Bar, Line } from 'react-chartjs-2';
import { gcK } from '@/lib/data';

const barOpts = (showLegend = true) => ({
  responsive: true, maintainAspectRatio: false,
  plugins: { legend: { display: showLegend, position: 'top', labels: { font: { size: 10 }, boxWidth: 10 } } },
  scales: {
    y: { ticks: { font: { size: 10 } }, grid: { color: '#F0EFE9' } },
    x: { ticks: { font: { size: 10 } }, grid: { display: false } },
  },
});

export default function RatiosPanel({ fin }) {
  const is6 = fin.is6;
  const lbl = fin.lbl;
  const d   = is6 ? fin.d : null;
  const py  = fin.priorYear;
  const pyr = py?.ratios ?? {};  // prior-year ratios from API

  const npm = is6 ? (fin.d.net[5] / fin.d.comm[5] * 100).toFixed(2) : fin.npm;
  const cti = is6 ? (fin.d.exp[5] / fin.d.comm[5] * 100).toFixed(1) : fin.cti;
  const roa = is6 ? (((fin.d.comm[5] - fin.d.exp[5] + fin.d.inv[5]) / fin.balanceSheet.assets.total) * 100).toFixed(2) : fin.roa;
  const ic  = is6 ? (((fin.d.comm[5] - fin.d.exp[5] + fin.d.inv[5]) / fin.fyFc)).toFixed(2) : fin.ic;
  const roe = is6 ? (fin.d.net[5] / fin.balanceSheet.equity.statedCapital * 100).toFixed(2) : fin.roe;
  const at  = fin.at  ?? (fin.is6 ? (fin.d.comm[5] / fin.balanceSheet.assets.total).toFixed(3) : '–');
  const cr  = fin.cr  ?? (fin.balanceSheet.assets.current.total / fin.balanceSheet.liabilities.total).toFixed(2);

  // Revenue to staff cost (current period)
  const revToStaff = fin.is6
    ? (fin.d.comm[5] / (fin.fyExpenses?.sal || 1)).toFixed(2)
    : fin.E?.sal ? (fin.comm / fin.E.sal).toFixed(2) : pyr.revenueToStaff ?? '–';

  const patNeg  = parseFloat(npm)  < 0;
  const ctiHigh = parseFloat(cti)  > 100;
  const icLow   = parseFloat(ic)   < 1;

  // Compute ROA direction vs prior year
  const roaDiff  = pyr.roa ? (parseFloat(roa) - parseFloat(pyr.roa)).toFixed(2) : null;
  const roaLabel = roaDiff !== null
    ? (parseFloat(roaDiff) >= 0 ? `↑ +${roaDiff}pp` : `↓ ${roaDiff}pp`)
    : '–';

  const ratiosChartData = is6
    ? {
        labels: d.years,
        datasets: [
          { label: 'Net Margin %',  data: d.net.map((n,i) => parseFloat((n / d.comm[i] * 100).toFixed(2))), borderColor: '#1D9E75', backgroundColor: 'rgba(29,158,117,.1)', fill: false, tension: 0.3 },
          { label: 'Cost/Income %', data: d.exp.map((e,i) => parseFloat((e / d.comm[i] * 100).toFixed(1))), borderColor: '#DC2626', backgroundColor: 'rgba(220,38,38,.1)',   fill: false, tension: 0.3 },
        ],
      }
    : {
        labels: ['GP Margin%', 'Net Margin%', 'ROA%', 'Cost/Income%'],
        datasets: [
          { label: lbl, data: [100, parseFloat(npm), parseFloat(roa), parseFloat(cti)], backgroundColor: ['#1D9E75', patNeg ? '#DC2626' : '#1D9E75', '#185FA5', ctiHigh ? '#DC2626' : '#1D9E75'], borderRadius: 4 },
          ...(pyr.npm && pyr.roa && pyr.cti
            ? [{ label: 'FY 2025', data: [100, parseFloat(pyr.npm), parseFloat(pyr.roa), parseFloat(pyr.cti)], backgroundColor: '#9FE1CB', borderRadius: 4 }]
            : []),
        ],
      };

  return (
    <>
      <div className="infobox">Ratios Analysis — {lbl}. (GH¢)</div>

      <div className="g22">
        <div className="card">
          <div className="ct">Profitability &amp; performance <span>{lbl} | 2025</span></div>
          <table className="tbl">
            <thead>
              <tr><th>Ratio</th><th>Formula</th><th className="tr">{lbl}</th><th className="tr">2025</th><th className="tr">Direction</th></tr>
            </thead>
            <tbody>
              <tr>
                <td>Gross profit margin</td><td className="tm">GP / Sales</td>
                <td className="tr fw pos">100.0%</td>
                <td className="tr pos">100.0%</td>
                <td className="tr pos">→ Stable</td>
              </tr>
              <tr>
                <td>Net profit margin</td><td className="tm">PAT / Sales</td>
                <td className="tr fw"><span className={patNeg ? 'neg' : 'pos'}>{patNeg ? `(${Math.abs(parseFloat(npm)).toFixed(2)}%)` : npm + '%'}</span></td>
                <td className="tr">{pyr.npm ? pyr.npm + '%' : '–'}</td>
                <td className={`tr ${patNeg ? 'neg' : 'pos'}`}>{patNeg ? '↓ Loss period' : '↑ Profit'}</td>
              </tr>
              <tr>
                <td>Return on assets</td><td className="tm">PBIT / Assets</td>
                <td className="tr fw">{roa}%</td>
                <td className="tr">{pyr.roa ? pyr.roa + '%' : '–'}</td>
                <td className="tr">{roaLabel}</td>
              </tr>
              <tr>
                <td>Return on equity</td><td className="tm">PAT / Equity</td>
                <td className="tr fw"><span className={parseFloat(roe) < 0 ? 'neg' : 'pos'}>{parseFloat(roe) < 0 ? `(${Math.abs(parseFloat(roe)).toFixed(2)}%)` : roe + '%'}</span></td>
                <td className="tr">{pyr.roe ? pyr.roe + '%' : '–'}</td>
                <td className="tr neg">↓</td>
              </tr>
              <tr>
                <td>Interest cover</td><td className="tm">PBIT / Finance cost</td>
                <td className="tr fw"><span className={icLow ? 'neg' : 'pos'}>{icLow ? `(${Math.abs(parseFloat(ic)).toFixed(2)}×)` : ic + '×'}</span></td>
                <td className="tr">{pyr.ic ? pyr.ic + '×' : '–'}</td>
                <td className="tr neg">↓ Below 1.0</td>
              </tr>
              <tr>
                <td>Cost-to-income</td><td className="tm">Opex / Op. income</td>
                <td className="tr fw"><span className={ctiHigh ? 'neg' : 'pos'}>{cti}%</span></td>
                <td className="tr">{pyr.cti ? pyr.cti + '%' : '–'}</td>
                <td className={`tr ${ctiHigh ? 'neg' : 'pos'}`}>{ctiHigh ? '↑ Worsening' : '↓ Improving'}</td>
              </tr>
              <tr>
                <td>Revenue to staff cost</td><td className="tm">Revenue / Staff</td>
                <td className="tr fw">{revToStaff}×</td>
                <td className="tr">{pyr.revenueToStaff ? pyr.revenueToStaff + '×' : '–'}</td>
                <td className="tr tm">— Stable</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="card">
          <div className="ct">Solvency &amp; efficiency</div>
          <table className="tbl" style={{ marginBottom: 14 }}>
            <thead><tr><th>Ratio</th><th className="tr">Value</th><th className="tr">Benchmark</th><th>Status</th></tr></thead>
            <tbody>
              <tr>
                <td>Current ratio</td><td className="tr fw">{cr}×</td><td className="tr tm">&gt; 1.5</td>
                <td><span className="pill p-ok"><span className="pd" />Healthy</span></td>
              </tr>
              <tr>
                <td>Asset turnover</td><td className="tr fw">{at}×</td><td className="tr tm">&gt; 0.5</td>
                <td><span className="pill p-ok"><span className="pd" />Good</span></td>
              </tr>
              <tr>
                <td>Cost-to-income</td><td className="tr fw"><span className={ctiHigh ? 'neg' : 'pos'}>{cti}%</span></td><td className="tr tm">&lt; 100%</td>
                <td><span className={`pill ${ctiHigh ? 'p-bad' : 'p-ok'}`}><span className="pd" />{ctiHigh ? 'Alert' : 'Good'}</span></td>
              </tr>
              <tr>
                <td>Interest cover</td><td className="tr fw"><span className={icLow ? 'neg' : 'pos'}>{icLow ? `(${Math.abs(parseFloat(ic)).toFixed(2)}×)` : ic + '×'}</span></td><td className="tr tm">&gt; 2.0</td>
                <td><span className={`pill ${icLow ? 'p-bad' : 'p-ok'}`}><span className="pd" />{icLow ? 'Critical' : 'OK'}</span></td>
              </tr>
            </tbody>
          </table>
          <div className="cws">
            {is6
              ? <Line data={ratiosChartData} options={{ ...barOpts(true), scales: { y: { ticks: { font: { size: 10 } }, grid: { color: '#F0EFE9' } }, x: { ticks: { font: { size: 10 } }, grid: { display: false } } } }} />
              : <Bar  data={ratiosChartData} options={barOpts(true)} />}
          </div>
        </div>
      </div>
    </>
  );
}

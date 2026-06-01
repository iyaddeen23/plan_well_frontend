'use client';
import { useMemo } from 'react';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement,
  LineElement, PointElement, Title, Tooltip, Legend, Filler,
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { gc, gcK } from '@/lib/data';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, LineElement, PointElement, Title, Tooltip, Legend, Filler);

const chartOpts = (showLegend = false) => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: showLegend, position: 'top', labels: { font: { size: 10 }, boxWidth: 10 } },
  },
  scales: {
    y: { ticks: { callback: v => gcK(v), font: { size: 10 } }, grid: { color: '#F0EFE9' } },
    x: { ticks: { font: { size: 10 } }, grid: { display: false } },
  },
});

const doughnutOpts = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { position: 'bottom', labels: { font: { size: 10 }, boxWidth: 10 } } },
};

export default function DashPanel({ fin }) {
  const is6 = fin.is6;
  const d   = is6 ? fin.d : null;

  const comm   = is6 ? d.comm[5] : fin.comm;
  const inv    = is6 ? d.inv[5]  : fin.inv;
  const pat    = is6 ? d.net[5]  : fin.pat;
  const lbl    = fin.lbl;

  const npm = is6 ? (pat / comm * 100).toFixed(2) : fin.npm;
  const cti = is6 ? (d.exp[5] / comm * 100).toFixed(1) : fin.cti;
  const roa = is6 ? (((comm - d.exp[5] + inv) / fin.balanceSheet.assets.total) * 100).toFixed(2) : fin.roa;
  const cr  = fin.cr ?? (fin.balanceSheet.assets.current.total / fin.balanceSheet.liabilities.total).toFixed(2);

  const cashAtBank = fin.balanceSheet.assets.current.cashAtBank;

  const revChartData = is6
    ? { labels: d.years, datasets: [
        { label: 'Commission Revenue', data: d.comm, borderColor: '#1D9E75', backgroundColor: 'rgba(29,158,117,.15)', fill: true, tension: 0.3, pointRadius: 4 },
        { label: 'Total Expenses',     data: d.exp,  borderColor: '#DC2626', backgroundColor: 'rgba(220,38,38,.1)',   fill: true, tension: 0.3, pointRadius: 4 },
      ] }
    : { labels: ['Motor','Fire/Theft','Life','Bonds','Engineering','Liability','Marine','Other'],
        datasets: [{ label: 'GH¢', data: fin.products, backgroundColor: ['#1D9E75','#0F6E56','#FAC775','#185FA5','#9FE1CB','#6B6B68','#E1F5EE','#DC2626'], borderRadius: 4, borderSkipped: false }] };

  const rvxChartData = is6
    ? { labels: d.years, datasets: [{ label: 'Net Profit/(Loss)', data: d.net, backgroundColor: d.net.map(v => v >= 0 ? '#1D9E75' : '#DC2626'), borderRadius: 4 }] }
    : { labels: ['Commission','Investment','Exchange Loss','Expenses'],
        datasets: [{ data: [fin.comm, fin.inv, fin.exch, fin.exp], backgroundColor: ['#1D9E75','#FAC775','#DC2626','#6B6B68'], borderWidth: 2, borderColor: '#fff' }] };

  const E = is6 ? fin.E : fin.E;

  return (
    <>
      <div className="kgrid">
        <div className="kpi">
          <div className="kl">Commission revenue</div>
          <div className="kv">{gc(comm)}</div>
          <div className="ks">{lbl} · 7 lines</div>
          <div className="kt up">↑ On track</div>
        </div>
        <div className="kpi a">
          <div className="kl">Investment income</div>
          <div className="kv">{gc(inv)}</div>
          <div className="ks">Fixed deposits</div>
          <div className="kt up">↑ Strong yield</div>
        </div>
        <div className="kpi b">
          <div className="kl">Cash at bank</div>
          <div className="kv">{gc(cashAtBank)}</div>
          <div className="ks">Fidelity + Ecobank</div>
          <div className="kt up">↑ Healthy</div>
        </div>
        <div className="kpi r">
          <div className="kl">Net profit / (loss)</div>
          <div className="kv" style={{ color: pat < 0 ? 'var(--red)' : 'var(--teal-bright)' }}>
            {pat < 0 ? `(${gc(Math.abs(pat))})` : gc(pat)}
          </div>
          <div className="ks">After tax · {lbl}</div>
          <div className={`kt ${pat < 0 ? 'dn' : 'up'}`}>{pat < 0 ? '↓ Loss this period' : '↑ Profit this period'}</div>
        </div>
      </div>

      <div className="g2">
        <div className="card">
          <div className="ct">
            {is6 ? 'Commission vs Expenses (6yr)' : 'Commission by product'}
            <span>{lbl} · GH¢</span>
          </div>
          <div className="cwt">
            {is6
              ? <Line data={revChartData} options={{ ...chartOpts(true), scales: { y: { ticks: { callback: v => gcK(v), font: { size: 10 } }, grid: { color: '#F0EFE9' } }, x: { ticks: { font: { size: 10 } }, grid: { display: false } } } }} />
              : <Bar  data={revChartData} options={chartOpts(false)} />}
          </div>
        </div>
        <div className="card">
          <div className="ct">
            {is6 ? 'Net Profit/(Loss) by Year' : 'Revenue vs Expenses'}
            <span>{lbl}</span>
          </div>
          <div className="cwt">
            {is6
              ? <Bar      data={rvxChartData} options={chartOpts(false)} />
              : <Doughnut data={rvxChartData} options={doughnutOpts} />}
          </div>
        </div>
      </div>

      <div className="g3">
        <div className="card">
          <div className="ct">P&amp;L snapshot</div>
          {!is6 ? <>
            <div className="fr"><span>Commission</span><span className="pos fw">{gc(fin.comm).replace('GH¢','')}</span></div>
            <div className="fr"><span>Investment income</span><span className="pos fw">{gc(fin.inv).replace('GH¢','')}</span></div>
            <div className="fr"><span>Exchange loss</span><span className="neg">({gc(fin.exch).replace('GH¢','')})</span></div>
            <div className="fr fw"><span>Total revenue</span><span className={fin.totRev >= 0 ? 'pos' : 'neg'}>{gc(fin.totRev).replace('GH¢','')}</span></div>
            <div className="fr"><span>Expenses</span><span className="neg">({gc(fin.exp).replace('GH¢','')})</span></div>
            <div className="fr"><span>Finance cost</span><span className="neg">({gc(fin.fc).replace('GH¢','')})</span></div>
            <div className="fr"><span>Tax</span><span className="neg">({gc(fin.tx).replace('GH¢','')})</span></div>
            <div className="fr fw" style={{ borderTop: '2px solid var(--border)', paddingTop: 8 }}>
              <span>Net profit/(loss)</span>
              <span className={fin.pat < 0 ? 'neg' : 'pos'}>{fin.pat < 0 ? `(${gc(Math.abs(fin.pat)).replace('GH¢','')})` : gc(fin.pat).replace('GH¢','')}</span>
            </div>
          </> : <>
            {d.years.map((yr, i) => (
              <div className="fr" key={yr}>
                <span>{yr}</span>
                <span className={d.net[i] >= 0 ? 'pos fw' : 'neg fw'}>{d.net[i] >= 0 ? gc(d.net[i]) : `(${gc(Math.abs(d.net[i]))})`}</span>
              </div>
            ))}
          </>}
        </div>

        <div className="card">
          <div className="ct">Top expenses</div>
          {!is6 ? <>
            <div className="fr"><span>Salaries</span><span className="neg fw">{gc(E.sal).replace('GH¢','')}</span></div>
            <div className="fr"><span>Business promotion</span><span className="neg fw">{gc(E.biz).replace('GH¢','')}</span></div>
            <div className="fr"><span>Depreciation</span><span className="neg fw">{gc(E.dep).replace('GH¢','')}</span></div>
            <div className="fr"><span>Exchange loss</span><span className="neg fw">{gc(fin.exch).replace('GH¢','')}</span></div>
            <div className="fr"><span>Management fees</span><span className="neg fw">{gc(E.mgmt).replace('GH¢','')}</span></div>
            <div className="fr"><span>Rent &amp; occupancy</span><span className="neg fw">{gc(E.rent).replace('GH¢','')}</span></div>
            <div className="fr"><span>Finance charges</span><span className="neg fw">{gc(fin.fc).replace('GH¢','')}</span></div>
          </> : <>
            <div className="fr"><span>2026 G&amp;A</span><span className="neg fw">{gc(d.exp[5])}</span></div>
            <div className="fr"><span>2025 G&amp;A</span><span className="neg fw">{gc(d.exp[4])}</span></div>
            <div className="fr"><span>2024 G&amp;A</span><span className="neg fw">{gc(d.exp[3])}</span></div>
            <div className="fr"><span>2023 G&amp;A</span><span className="neg fw">{gc(d.exp[2])}</span></div>
          </>}
        </div>

        <div className="card">
          <div className="ct">Key ratios <span>{lbl}</span></div>
          <div className="fr"><span>Gross profit margin</span><span className="pos fw">100.0%</span></div>
          <div className="fr"><span>Net profit margin</span><span className={parseFloat(npm) < 0 ? 'neg fw' : 'pos fw'}>{parseFloat(npm) < 0 ? `(${Math.abs(parseFloat(npm)).toFixed(2)}%)` : npm + '%'}</span></div>
          <div className="fr"><span>Cost-to-income</span><span className={parseFloat(cti) > 100 ? 'neg fw' : 'pos fw'}>{cti}%</span></div>
          <div className="fr"><span>Return on assets</span><span className="fw">{roa}%</span></div>
          <div className="fr"><span>Current ratio</span><span className="pos fw">{cr}×</span></div>
          <div className="fr"><span>Interest cover</span><span className={parseFloat(fin.ic || 0) < 1 ? 'neg fw' : 'fw'}>{fin.ic ?? '–'}×</span></div>
        </div>
      </div>
    </>
  );
}

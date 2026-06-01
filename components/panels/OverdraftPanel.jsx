import { gc } from '@/lib/data';

export default function OverdraftPanel({ fin }) {
  const lbl      = fin.lbl;
  const fc       = fin.fc;
  const f        = fin.f;
  const bs       = fin.balanceSheet;
  const overdraft = bs.liabilities.bankOverdraft;

  return (
    <>
      <div className="infobox">Overdraft Interest — {lbl}. (GH¢)</div>

      <div className="kgrid3">
        <div className="kpi r"><div className="kl">Overdraft balance</div><div className="kv neg">{gc(overdraft)}</div><div className="ks">Per trial balance</div></div>
        <div className="kpi a"><div className="kl">Interest charged</div><div className="kv neg">{gc(fc)}</div><div className="ks">Finance cost (Note 8)</div></div>
        <div className="kpi b"><div className="kl">Effective rate</div><div className="kv">~20.4%</div><div className="ks">Annual</div></div>
      </div>

      <div className="card">
        <div className="ct">Overdraft breakdown <span>{lbl}</span></div>
        <div className="fr"><span>Bank overdraft &amp; loans</span><span className="neg fw">{gc(overdraft)}</span></div>
        <div className="fr"><span>Interest paid/accrued</span><span className="neg fw">{gc(fc)}</span></div>
        <div className="fr"><span>Quarterly interest cost</span><span className="neg fw">{gc(Math.round(fin.fyFc * f))}</span></div>
        <div className="fr"><span>Held at</span><span>Fidelity Bank &amp; Ecobank</span></div>
        <div className="notebox" style={{ marginTop: 14 }}>
          Effective rate ~20% is a significant cost. Management should renegotiate facility terms or reduce overdraft utilisation to improve profitability.
        </div>
      </div>
    </>
  );
}

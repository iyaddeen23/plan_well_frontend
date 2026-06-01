import { gc } from '@/lib/data';

export default function NotesPanel({ fin }) {
  const lbl  = fin.lbl;
  // fin.E is always available — for is6 it is the full-year expense breakdown
  const E    = fin.E;
  const comm = fin.is6 ? fin.d.comm[5] : fin.comm;
  const inv  = fin.is6 ? fin.d.inv[5]  : fin.inv;
  const fc   = fin.fc;
  const exp  = fin.is6 ? fin.d.exp[5]  : fin.exp;
  const exch = fin.exch;

  const N = ({ v }) => gc(v).replace('GH¢','');

  return (
    <>
      <div className="infobox">Notes to the Financial Statements — {lbl}. (GH¢)</div>

      <div className="g22">
        <div className="card">
          <div className="ct">Note 5 · Revenue &amp; Note 7 · Other Income</div>
          <div className="frs">Note 5 · Revenue</div>
          <div className="fr"><span>Commission income</span><span className="pos fw"><N v={comm} /></span></div>
          <div className="frs">Note 7 · Other Income</div>
          <div className="fr"><span>Investment income</span><span className="pos fw"><N v={inv} /></span></div>
          <div className="fr fw"><span>Total other income</span><span className="pos"><N v={inv} /></span></div>
          <div className="frs">Note 8 · Finance Cost</div>
          <div className="fr"><span>Interest paid</span><span className="neg fw"><N v={fc} /></span></div>
        </div>

        <div className="card">
          <div className="ct">Note 6 · G&amp;A Expenses (full list)</div>
          {[
            ['Salaries & allowances',          E.sal],
            ["Directors' remuneration",         E.dir],
            ['Management fees',                 E.mgmt],
            ['Professional fees',               E.prof],
            ['Printing & stationery',           E.print],
            ['Communication',                   E.comm2],
            ['Utilities',                       E.util],
            ['Levies & licensing',              E.levy],
            ['Audit fees',                      E.audit],
            ['Fuel & lubricants',               E.fuel],
            ['Travel & transport',              E.trav],
            ['Repairs & maintenance',           E.rep],
            ['Rent & occupancy',                E.rent],
            ['Refreshment & entertainment',     E.refresh],
            ['Bank charges',                    E.bank],
            ['Office supplies',                 E.office],
            ['Business promotion',              E.biz],
            ['Insurance',                       E.ins],
            ['Translation / exchange loss',     exch],
            ['Depreciation',                    E.dep],
            ['Amortisation',                    E.amort],
          ].map(([label, val]) => (
            <div className="fr" key={label}>
              <span>{label}</span>
              <span className="neg">{gc(val).replace('GH¢','')}</span>
            </div>
          ))}
          <div className="fr fw" style={{ borderTop: '2px solid var(--border)', paddingTop: 8 }}>
            <span>TOTAL G&amp;A</span>
            <span className="neg">{gc(exp).replace('GH¢','')}</span>
          </div>
        </div>
      </div>
    </>
  );
}

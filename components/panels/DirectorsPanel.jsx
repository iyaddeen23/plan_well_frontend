export default function DirectorsPanel() {
  return (
    <>
      <div className="infobox">Directors Report — Planwell Insurance Brokers Limited. Year ended 31 December 2026.</div>

      <div className="g22">
        <div className="card">
          <div className="ct">Corporate information</div>
          {[
            ['Company name',       'Planwell Insurance Brokers Limited'],
            ['Registered office',  'No. 87B Guava Street, Off Mulberry Street, East Legon, Accra'],
            ['Postal address',     'P.O. Box MD 877, Accra'],
            ['Principal activity', 'Insurance brokerage services'],
            ['Incorporated under', 'Companies Act 2019 (Act 992)'],
            ['Reporting standards','IFRS for SMEs'],
            ['Functional currency','Ghana Cedis (GH¢)'],
          ].map(([label, val]) => (
            <div className="fr" key={label}>
              <span>{label}</span>
              <span className="fw">{val}</span>
            </div>
          ))}
        </div>

        <div className="card">
          <div className="ct">Table of contents</div>
          {[
            ['Corporate information',               'Page 3'],
            ['Report of the directors',             'Page 4'],
            ["Auditor's report",                    'Page 5'],
            ['Statement of P&L',                    'Page 6'],
            ['Statement of financial position',     'Page 7'],
            ['Notes to financial statements',       'Pages 8+'],
          ].map(([label, page]) => (
            <div className="fr" key={label}>
              <span>{label}</span>
              <span className="tm">{page}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="ct">Key accounting policies</div>
        <div style={{ fontSize: 12.5, color: 'var(--text)', lineHeight: 1.75 }}>
          <p style={{ marginBottom: 10 }}>
            <strong>Basis of preparation:</strong> Going-concern basis, IFRS for SMEs, historical cost.
          </p>
          <p style={{ marginBottom: 10 }}>
            <strong>Revenue recognition:</strong> Commission recognised over time based on agreed rate. Single performance obligation per policy placement.
          </p>
          <p style={{ marginBottom: 10 }}>
            <strong>Foreign currency:</strong> Translated at BOG official rates. Exchange differences recognised in P&amp;L.
          </p>
          <p>
            <strong>Going concern:</strong> Board satisfied the company will continue operating for the next 12 months.
          </p>
        </div>
      </div>
    </>
  );
}

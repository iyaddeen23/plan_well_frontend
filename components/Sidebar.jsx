export default function Sidebar({ curPanel, onNav, isOpen, onClose }) {
  const Item = ({ id, icon, label }) => (
    <button
      className={`ni${curPanel === id ? ' active' : ''}`}
      onClick={() => { onNav(id); onClose?.(); }}
    >
      <span className="ni-ico">{icon}</span>
      {label}
    </button>
  );

  return (
    <aside className={`sb${isOpen ? ' sb-open' : ''}`}>
      <div className="sb-logo">
        <img src="/logo.png" alt="Planwell" />
        <button className="sb-close" onClick={onClose} aria-label="Close menu">×</button>
      </div>

      <div className="sb-sec">Overview</div>
      <Item id="dash"  icon="📊" label="Dashboard" />
      <Item id="afs"   icon="📑" label="AFS — P&L & Balance Sheet" />

      <div className="sb-sec">Working Papers</div>
      <Item id="tb"      icon="⚖️" label="Trial Balance" />
      <Item id="je"      icon="📒" label="Journal Entry" />
      <Item id="imprest" icon="💵" label="Imprest Cash Book" />

      <div className="sb-sec">Income &amp; Receivables</div>
      <Item id="prod" icon="📈" label="Production (by Insurer)" />
      <Item id="ar"   icon="🧾" label="Accounts Receivables" />

      <div className="sb-sec">Liabilities &amp; Finance</div>
      <Item id="bank"      icon="🏦" label="Bank Charges" />
      <Item id="overdraft" icon="📉" label="Overdraft Interest" />
      <Item id="loan"      icon="📅" label="Loan Schedule" />
      <Item id="tax"       icon="🏛️" label="Tax Credit (CIT/WHT)" />

      <div className="sb-sec">Reports &amp; Analysis</div>
      <Item id="ratios"    icon="📐" label="Ratios Analysis" />
      <Item id="notes"     icon="📝" label="Notes to Accounts" />
      <Item id="directors" icon="🏢" label="Directors Report" />

      <div className="sb-foot">
        <div className="sb-user">
          <div className="sb-av">PA</div>
          <div>
            <div className="sb-name">Patrick Agyemang</div>
            <div className="sb-role">Managing Director</div>
          </div>
        </div>
      </div>
    </aside>
  );
}

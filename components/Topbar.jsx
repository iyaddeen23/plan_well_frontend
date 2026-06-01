import { gc } from '@/lib/data';

export default function Topbar({ title, retainedDeficit, pat, onExportAll, user, onSignOut, onMenuOpen }) {
  return (
    <div className="topbar">
      {/* Hamburger — visible on mobile only via CSS */}
      <button className="nav-toggle" onClick={onMenuOpen} aria-label="Open menu">
        ☰
      </button>

      <div className="topbar-title">{title}</div>

      <div className="topbar-right">
        <div className="badge-r">
          <div className="rdot" />
          <span>Retained earnings deficit: {gc(retainedDeficit)}</span>
        </div>
        <button className="btn btn-g btn-print" onClick={() => window.print()}>🖨 Print</button>
        <button className="btn-export-all" onClick={onExportAll}>⬇ Export All</button>
        {user && (
          <button className="btn btn-g" onClick={onSignOut}>Sign out</button>
        )}
      </div>
    </div>
  );
}

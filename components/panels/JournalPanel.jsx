import { fmt2 } from '@/lib/data';

export default function JournalPanel({ fin, db, onOpenDrawer, onExport }) {
  const lbl = fin.lbl;

  return (
    <>
      <div className="section-toolbar">
        <div className="section-toolbar-left">Journal entries: <strong>{db.journal.length} entr{db.journal.length === 1 ? 'y' : 'ies'}</strong></div>
        <div className="toolbar-btns">
          <button className="btn-export" onClick={onExport}>⬇ Export to Excel</button>
          <button className="btn-add" onClick={() => onOpenDrawer('journal')}>＋ Add Journal Entry</button>
        </div>
      </div>

      <div className="infobox">Journal Entries — {lbl}. (GH¢)</div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="tbl">
          <thead>
            <tr>
              <th>Date</th><th>Ref</th><th>Particulars</th>
              <th className="tr">Amount (GH¢)</th><th>Dr Account</th><th>Cr Account</th>
              <th>Narration</th><th>Type</th><th>Period</th>
            </tr>
          </thead>
          <tbody>
            {db.journal.length === 0 ? (
              <tr>
                <td colSpan={9} style={{ color: 'var(--muted)', fontStyle: 'italic', fontSize: 12, padding: 16 }}>
                  No journal entries yet — click &ldquo;Add Journal Entry&rdquo; to post.
                </td>
              </tr>
            ) : db.journal.map((e, i) => (
              <tr key={i} className="new-row">
                <td>{e.date}</td>
                <td>{e.ref}</td>
                <td>{e.particulars}</td>
                <td className="tr tnum pos">{fmt2(e.amount)}</td>
                <td>{e.dr || e.drAccount}</td>
                <td>{e.cr || e.crAccount}</td>
                <td style={{ fontSize: 11 }}>{e.narration}</td>
                <td style={{ fontSize: 11 }}>{e.type || e.entryType}</td>
                <td style={{ fontSize: 11 }}>{e.period}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

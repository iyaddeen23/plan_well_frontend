const PERIOD_LABELS = {
  q1:  'Full Year 2026 — Jan to Dec',
  q2:  'Q2 2026 — Apr to Jun',
  q3:  'Q3 2026 — Jul to Sep',
  q4:  'Q4 2026 — Oct to Dec',
  fy:  'Full Year 2026 — Jan to Dec',
  '6y':   'Last 6 Years — 2021 to 2026',
  '6ytd': 'Last 6 Years YTD — Jan to current month each year',
};

export default function PeriodBar({ curPeriod, onSetPeriod }) {
  const Btn = ({ id, label }) => (
    <button
      className={`pbt${curPeriod === id ? ' active' : ''}`}
      onClick={() => onSetPeriod(id)}
    >
      {label}
    </button>
  );

  const ptag = {
    q1:  'Q1 2026 — Jan to Mar',
    q2:  'Q2 2026 — Apr to Jun',
    q3:  'Q3 2026 — Jul to Sep',
    q4:  'Q4 2026 — Oct to Dec',
    fy:  'Full Year 2026 — Jan to Dec',
    '6y':   'Last 6 Years — 2021 to 2026',
    '6ytd': 'Last 6 Years YTD — Jan to current month each year',
  }[curPeriod] || '';

  return (
    <div className="pbar">
      <span className="pbar-lbl">Period:</span>
      <Btn id="q1" label="Q1 Jan–Mar" />
      <Btn id="q2" label="Q2 Apr–Jun" />
      <Btn id="q3" label="Q3 Jul–Sep" />
      <Btn id="q4" label="Q4 Oct–Dec" />
      <div className="pbar-div" />
      <Btn id="fy" label="Full Year 2026" />
      <div className="pbar-div" />
      <Btn id="6y"   label="Last 6 Years" />
      <Btn id="6ytd" label="Last 6 Years YTD" />
      <span className="ptag">{ptag}</span>
    </div>
  );
}

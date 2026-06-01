/** Format a number as GH¢ with thousand separators. */
export function gc(v) {
  return 'GH¢' + Math.abs(Math.round(v)).toLocaleString();
}

/** Format a number as GH¢NNK (thousands). */
export function gcK(v) {
  return 'GH¢' + Math.round(Math.abs(v) / 1000) + 'K';
}

/** Format a number to 2 decimal places with commas, or '–' if empty. */
export function fmt2(v) {
  return v != null && v !== ''
    ? parseFloat(v).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : '–';
}

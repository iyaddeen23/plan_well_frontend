/**
 * Excel export utilities.
 * exportAll(db, fin) — full workbook
 * exportSection(type, db) — single sheet
 *
 * All financial data comes from `fin` (API-driven); no hardcoded figures.
 */

export async function exportAll(db, fin) {
  const XLSX = (await import('xlsx')).default;
  const wb   = XLSX.utils.book_new();
  const bs   = fin?.balanceSheet;
  const reClose = fin?.reClose ?? bs?.equity?.retainedOpen ?? '';

  // ─── Trial Balance ──────────────────────────────────────────────────────────
  const tbData = [
    ['PLANWELL INSURANCE BROKERS LIMITED'],
    ['TRIAL BALANCE — 31 DECEMBER 2026'],
    [''],
    ['Particulars', '2025 (GH¢)', '2026 (GH¢)', 'Movement'],
  ];
  if (bs) {
    tbData.push(
      ['Non-current assets (net)',      bs.assets.nonCurrent.total,          bs.assets.nonCurrent.total,          '—'],
      ['Current assets',                bs.assets.current.total,             bs.assets.current.total,             '—'],
      ['  Commissions receivable',      bs.assets.current.commReceivable,    bs.assets.current.commReceivable,    '—'],
      ['  Interest receivable',         bs.assets.current.interestReceivable,bs.assets.current.interestReceivable,'—'],
      ['  Cash at bank',                bs.assets.current.cashAtBank,        bs.assets.current.cashAtBank,        '—'],
      ['Total assets',                  bs.assets.total,                     bs.assets.total,                     '—'],
      ['Stated capital',               -bs.equity.statedCapital,            -bs.equity.statedCapital,            '—'],
      ['Retained earnings',             bs.equity.retainedOpen,              reClose,                             reClose - bs.equity.retainedOpen],
      ['Total liabilities',            -bs.liabilities.total,               -bs.liabilities.total,               '—'],
    );
  }
  db.tb.forEach(e => tbData.push([e.particulars, e.debit || 0, e.credit || 0, e.adjtype || e.adjType]));
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(tbData), 'TRIAL BALANCE');

  // ─── Journal Entries ────────────────────────────────────────────────────────
  const jeData = [
    ['PLANWELL INSURANCE BROKERS LIMITED'], ['JOURNAL ENTRIES — 2026'], [''],
    ['Date', 'Reference', 'Particulars', 'Dr Account', 'Cr Account', 'Amount (GH¢)', 'Type', 'Period', 'Narration'],
  ];
  db.journal.forEach(e => jeData.push([e.date, e.ref, e.particulars, e.dr || e.drAccount, e.cr || e.crAccount, e.amount, e.type || e.entryType, e.period, e.narration]));
  if (!db.journal.length) jeData.push(['No entries recorded', '', '', '', '', '', '', '', '']);
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(jeData), 'JOURNAL ENTRY');

  // ─── Imprest Cash Book ──────────────────────────────────────────────────────
  const imData = [
    ['PLANWELL INSURANCE BROKERS LIMITED'], ['IMPREST CASH BOOK — 2026'], [''],
    ['Date', 'CHQ No.', 'Invoice No.', 'Details', 'Payee', 'Category', 'Amount (GH¢)', 'Type', 'Period'],
  ];
  db.imprest.forEach(e => imData.push([e.date, e.chq, e.invoice, e.details, e.payee, e.category, e.amount, e.txtype || e.txType, e.period]));
  if (!db.imprest.length) imData.push(['No entries recorded', '', '', '', '', '', '', '', '']);
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(imData), 'IMPREST CASH BOOK');

  // ─── Production (Commission by Insurer) ────────────────────────────────────
  const prodData = [
    ['PLANWELL INSURANCE BROKERS LIMITED'], ['COMMISSION BY INSURER — 2026'], [''],
    ['Insurer', 'Product', 'Commission (GH¢)', 'Premium (GH¢)', 'Period', 'Client', 'Reference'],
  ];
  db.production.forEach(e => prodData.push([e.insurer === 'Other (specify below)' ? (e.insurerOther || 'Other') : e.insurer, e.product, e.amount || e.commission, e.premium, e.period, e.client || '', e.ref || '']));
  if (!db.production.length) prodData.push(['No entries recorded', '', '', '', '', '', '']);
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(prodData), 'PRODUCTION');

  // ─── Accounts Receivables ───────────────────────────────────────────────────
  const arData = [
    ['PLANWELL INSURANCE BROKERS LIMITED'], ['ACCOUNTS RECEIVABLES — 2026'], [''],
    ['Date', 'Client', 'Insurer', 'Product', 'Currency', 'FX Rate', 'Premium (GH¢)', 'Status', 'Balance (GH¢)', 'Commission'],
  ];
  db.ar.forEach(e => arData.push([e.date, e.client, e.insurer || '', e.product, e.currency, e.fxrate || e.fxRate || 1, e.premium, e.status, e.balance || e.outstandingBalance, e.amount || e.commission]));
  if (!db.ar.length) arData.push(['No entries recorded', '', '', '', '', '', '', '', '', '']);
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(arData), 'ACCOUNTS RECEIVABLES');

  // ─── Bank Transactions ──────────────────────────────────────────────────────
  const bankData = [
    ['PLANWELL INSURANCE BROKERS LIMITED'], ['BANK RECONCILIATION — 2026'], [''],
    ['Date', 'Account', 'Currency', 'Foreign Amount', 'FX Rate', 'GH¢ Equivalent', 'Type', 'Reference', 'Notes'],
  ];
  if (bs) {
    bankData.push(
      ['(Year-end closing balance)', 'All accounts', 'GH¢', '', '', bs.assets.current.cashAtBank, 'Reference', '', 'Per TB'],
      ['(Bank overdraft)',           'Fidelity + Ecobank', 'GH¢', '', '', -bs.liabilities.bankOverdraft, 'Reference', '', 'Per TB'],
    );
  }
  db.bank.forEach(e => bankData.push([e.date, e.account, e.currency, e.amount || e.amountForeign, e.fxrate || e.fxRate || 1, e.ghc || e.amountGhc || e.amount, e.txtype || e.txType, e.ref || '', e.notes || '']));
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(bankData), 'BANK CHARGES');

  // ─── AFS (Statement of P&L) ─────────────────────────────────────────────────
  const afsData = [
    ['PLANWELL INSURANCE BROKERS LIMITED'],
    ['STATEMENT OF PROFIT OR LOSS — YEAR ENDED 31 DECEMBER 2026'],
    [''],
    ['', 'Note', fin?.lbl ?? '', 'FY 2025'],
  ];
  if (fin && !fin.is6) {
    const py = fin.priorYear;
    afsData.push(
      ['Commission Revenue',        '5', fin.comm,   py?.comm    ?? ''],
      ['Gross profit',              '',  fin.comm,   py?.comm    ?? ''],
      ['G&A Expenses',              '6', -fin.exp,   -(py?.exp   ?? '')],
      ['Operating Profit/(Loss)',   '',  fin.opLoss, py?.opLoss  ?? ''],
      ['Investment Income',         '7', fin.inv,    py?.inv     ?? ''],
      ['PBIT',                      '',  fin.pbit,   py?.pbit    ?? ''],
      ['Finance Cost',              '8', -fin.fc,    -(py?.fc    ?? '')],
      ['Profit/(Loss) Before Tax',  '',  fin.pbt,    (py?.pbit ?? 0) - (py?.fc ?? 0)],
      ['Tax Expense',               '9', -fin.tx,    -(py?.tx    ?? '')],
      ['Profit/(Loss) After Tax',   '',  fin.pat,    py?.net     ?? ''],
      [''],
      ['Opening Retained Earnings', '', fin.balanceSheet?.equity?.retainedOpen ?? '', ''],
      ['Closing Retained Earnings', '', fin.reClose ?? '', ''],
    );
  }
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(afsData), 'AFS');

  XLSX.writeFile(wb, 'Planwell_Financial_Statements_' + new Date().toISOString().slice(0, 10) + '.xlsx');
}

export async function exportSection(type, db) {
  const XLSX = (await import('xlsx')).default;
  const wb   = XLSX.utils.book_new();
  let rows   = [];

  if (type === 'journal') {
    rows = [['Date', 'Reference', 'Particulars', 'Dr Account', 'Cr Account', 'Amount (GH¢)', 'Type', 'Period', 'Narration']];
    db.journal.forEach(e => rows.push([e.date, e.ref, e.particulars, e.dr || e.drAccount, e.cr || e.crAccount, e.amount, e.type || e.entryType, e.period, e.narration]));
  } else if (type === 'imprest') {
    rows = [['Date', 'CHQ No.', 'Invoice No.', 'Details', 'Payee', 'Category', 'Amount (GH¢)', 'Type', 'Period']];
    db.imprest.forEach(e => rows.push([e.date, e.chq, e.invoice, e.details, e.payee, e.category, e.amount, e.txtype || e.txType, e.period]));
  } else if (type === 'production') {
    rows = [['Insurer', 'Product', 'Commission (GH¢)', 'Premium (GH¢)', 'Period', 'Client']];
    db.production.forEach(e => rows.push([e.insurer, e.product, e.amount || e.commission, e.premium, e.period, e.client || '']));
  } else if (type === 'ar') {
    rows = [['Date', 'Client', 'Insurer', 'Product', 'Currency', 'FX Rate', 'Premium', 'Status', 'Balance', 'Commission']];
    db.ar.forEach(e => rows.push([e.date, e.client, e.insurer || '', e.product, e.currency, e.fxrate || e.fxRate || 1, e.premium, e.status, e.balance || e.outstandingBalance, e.amount || e.commission]));
  } else if (type === 'bank') {
    rows = [['Date', 'Account', 'Currency', 'Amount', 'FX Rate', 'GH¢', 'Type', 'Notes']];
    db.bank.forEach(e => rows.push([e.date, e.account, e.currency, e.amount || e.amountForeign, e.fxrate || e.fxRate || 1, e.ghc || e.amountGhc || e.amount, e.txtype || e.txType, e.notes || '']));
  }

  if (!rows.length || rows.length <= 1) return false;
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(rows), type.toUpperCase());
  XLSX.writeFile(wb, 'Planwell_' + type + '_' + new Date().toISOString().slice(0, 10) + '.xlsx');
  return true;
}

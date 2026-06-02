/**
 * normalizeFinancials — transforms the backend period response into the flat
 * shape all panel components expect (fin.comm, fin.E, fin.insurers, …).
 *
 * Backend (non-is6) returns nested objects; panels were written against the
 * old frontend `computeFinancials` which returned a flat object.
 */
export function normalizeFinancials(raw) {
  if (!raw) return null;

  // Common fields present in every period response (is6 and quarterly)
  const shared = {
    balanceSheet:  raw.balanceSheet,
    loanSchedule:  raw.loanSchedule,
    loanHistory:   raw.loanHistory,
    loanDetails:   raw.loanDetails,
    taxStatement:  raw.taxStatement,
    priorYear:     raw.priorYear,
    // FY benchmarks always available for is6 panel fallbacks
    fyFc:          raw.fyFc,
    fyTx:          raw.fyTx,
    fyExch:        raw.fyExch,
    fyExpenses:    raw.fyExpenses,
  };

  if (raw.is6) {
    return {
      is6:  true,
      p:    raw.period,
      lbl:  raw.label,
      ptag: raw.label,
      d:    raw.data,
      // Expose full-year values so panels don't need hardcoded FY fallbacks
      E:    raw.fyExpenses,
      fc:   raw.fyFc,
      tx:   raw.fyTx,
      exch: raw.fyExch,
      f:    1,
      ...shared,
    };
  }

  // Non-is6: flatten nested backend response into the panel-expected shape
  const { income, profitLoss, expenses, products, insurers, ratios, equity, factor } = raw;
  return {
    is6:  false,
    p:    raw.period,
    lbl:  raw.label,
    ptag: raw.periodLabel,
    f:    factor,
    // Income statement
    comm:   income.comm,
    inv:    income.inv,
    exch:   income.exch,
    totRev: income.totRev,
    exp:    income.comm - profitLoss.opLoss,  // derived: exp = comm - opLoss
    // P&L
    opLoss: profitLoss.opLoss,
    pbit:   profitLoss.pbit,
    pbt:    profitLoss.pbt,
    pat:    profitLoss.pat,
    fc:     profitLoss.fc,
    tx:     profitLoss.tx,
    // Expense breakdown
    E: expenses,
    // Products & insurers
    products,
    insurerVals: insurers.values2026,
    insurers,
    // Ratios
    npm: ratios.npm,
    cti: ratios.cti,
    roa: ratios.roa,
    ic:  ratios.ic,
    roe: ratios.roe,
    at:  ratios.at,
    cr:  ratios.cr,
    // Equity
    reClose: equity.retainedClose,
    ...shared,
  };
}

/**
 * Planwell API client
 * Base URL is read from NEXT_PUBLIC_API_URL (falls back to localhost for dev).
 * Set NEXT_PUBLIC_API_URL in .env.local or your deployment environment.
 */

const BASE =
  (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_API_URL) ||
  'http://localhost:4000/api/v1';

// ─── Token helpers ─────────────────────────────────────────────────────────────
export function getToken()        { return typeof window !== 'undefined' ? localStorage.getItem('pw_access')  : null; }
export function clearTokens()     { localStorage.removeItem('pw_access'); localStorage.removeItem('pw_refresh'); }
function setTokens(access, refresh) {
  localStorage.setItem('pw_access', access);
  if (refresh) localStorage.setItem('pw_refresh', refresh);
}
function getRefreshToken() { return typeof window !== 'undefined' ? localStorage.getItem('pw_refresh') : null; }

// ─── Core fetch ────────────────────────────────────────────────────────────────
// Internal: one HTTP call, no retry logic.
async function _fetch(method, path, body) {
  const headers = { 'Content-Type': 'application/json' };
  const token   = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  let res;
  try {
    res = await fetch(`${BASE}${path}`, {
      method,
      headers,
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    });
  } catch {
    // fetch() itself threw — network error, CORS block, or server unreachable
    const err = new Error(
      `Cannot reach the server at ${BASE}. ` +
      'Check your internet connection or contact support.'
    );
    err.status = 0;
    throw err;
  }

  if (res.status === 204) return null;
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const msg = Array.isArray(data.message)
      ? data.message.join(', ')
      : (data.message || `Request failed (${res.status})`);
    const err = new Error(msg);
    err.status = res.status;
    throw err;
  }
  return data;
}

// Public: auto-refresh on 401 (Supabase tokens expire after 1 hour).
// On 401, tries once to refresh the token, then retries the request.
// If refresh also fails, clears tokens so the auth gate triggers re-login.
let _refreshing = null; // deduplicate concurrent refresh attempts

async function req(method, path, body) {
  try {
    return await _fetch(method, path, body);
  } catch (err) {
    if (err.status !== 401) throw err;
    // Don't try to refresh if we're already on the auth endpoints
    if (path.startsWith('/auth/')) throw err;

    try {
      // Deduplicate: if another request is already refreshing, wait for it
      if (!_refreshing) {
        _refreshing = _fetch('POST', '/auth/refresh', { refreshToken: getRefreshToken() })
          .then(d => { setTokens(d.accessToken, d.refreshToken ?? getRefreshToken()); })
          .finally(() => { _refreshing = null; });
      }
      await _refreshing;
      // Retry original request with new token
      return await _fetch(method, path, body);
    } catch {
      clearTokens();
      const sessionErr = new Error('Session expired. Please sign in again.');
      sessionErr.status = 401;
      throw sessionErr;
    }
  }
}

// ─── Auth ──────────────────────────────────────────────────────────────────────
export const auth = {
  /** Sign in and store JWT tokens. */
  signIn: (email, password) =>
    req('POST', '/auth/signin', { email, password }).then(d => {
      setTokens(d.accessToken, d.refreshToken);
      return d;
    }),

  /** Register a new account. Does NOT auto-sign-in. */
  signUp: (email, password, fullName) =>
    req('POST', '/auth/signup', { email, password, fullName }),

  /** Invalidate session and clear local tokens. */
  signOut: () => req('POST', '/auth/signout').finally(clearTokens),

  /** Return the currently authenticated user, or throw 401. */
  me: () => req('GET', '/auth/me'),

  /** Silently refresh the access token using the stored refresh token. */
  refresh: () =>
    req('POST', '/auth/refresh', { refreshToken: getRefreshToken() }).then(d => {
      setTokens(d.accessToken, getRefreshToken());
      return d;
    }),
};

// ─── Generic CRUD factory ──────────────────────────────────────────────────────
function crud(base) {
  return {
    list:   (params) => req('GET',   base + (params ? '?' + new URLSearchParams(params) : '')),
    get:    (id)     => req('GET',   `${base}/${id}`),
    create: (body)   => req('POST',  base, body),
    update: (id, body) => req('PATCH', `${base}/${id}`, body),
    remove: (id)     => req('DELETE', `${base}/${id}`),
    summary:(params) => req('GET',   `${base}/summary` + (params ? '?' + new URLSearchParams(params) : '')),
  };
}

// ─── Resource APIs ─────────────────────────────────────────────────────────────
export const journal = crud('/journal');

export const imprest = crud('/imprest');

export const production = crud('/production');

export const ar = crud('/ar');

export const bank = {
  ...crud('/bank'),
  reconciliation: (period) =>
    req('GET', `/bank/reconciliation?period=${encodeURIComponent(period)}`),
};

export const trialBalance = {
  ...crud('/trial-balance'),
  balanceCheck: () => req('GET', '/trial-balance/balance-check'),
};

export const financials = {
  periods:  ()       => req('GET', '/financials/periods'),
  period:   (p)      => req('GET', `/financials/period/${encodeURIComponent(p)}`),
  insurers: ()       => req('GET', '/financials/insurers'),
  expenses: (period) => req('GET', `/financials/expenses${period ? '?period=' + encodeURIComponent(period) : ''}`),
};

// ─── Field normalizers — API response → panel field names ─────────────────────
// Supabase returns snake_case column names (dr_account, tx_type, etc.).
// These functions map them to the short names panels use (dr, cr, txtype, …).
// Each case uses `??` so it works for both snake_case (DB response) and
// camelCase (in case a future API layer transforms the names).
export function normalizeEntry(type, e) {
  if (!e) return e;
  switch (type) {
    case 'journal':
      return {
        ...e,
        dr:   e.dr_account   ?? e.drAccount,
        cr:   e.cr_account   ?? e.crAccount,
        type: e.entry_type   ?? e.entryType,
      };
    case 'imprest':
      return {
        ...e,
        txtype: e.tx_type ?? e.txType,
      };
    case 'production':
      return {
        ...e,
        amount:       e.commission,
        insurerOther: e.insurer_other ?? e.insurerOther,
      };
    case 'ar':
      return {
        ...e,
        balance: e.outstanding_balance ?? e.outstandingBalance,
        amount:  e.commission,
        fxrate:  e.fx_rate             ?? e.fxRate,
      };
    case 'bank':
      return {
        ...e,
        amount: e.amount_foreign ?? e.amountForeign,
        ghc:    e.amount_ghc     ?? e.amountGhc,
        txtype: e.tx_type        ?? e.txType,
        fxrate: e.fx_rate        ?? e.fxRate,
      };
    case 'tb':
      return {
        ...e,
        adjtype: e.adj_type ?? e.adjType,
      };
    default:
      return e;
  }
}

// ─── Field mappers — form data → API payload ──────────────────────────────────
// Form fields use short names (dr, cr, txtype, fxrate, …) for brevity.
// These functions map them to the exact field names the API schemas require.
export function toApiPayload(type, data) {
  switch (type) {
    case 'journal':
      return {
        date:        data.date,
        ref:         data.ref         || '',
        particulars: data.particulars,
        drAccount:   data.dr,
        crAccount:   data.cr,
        amount:      parseFloat(data.amount)  || 0,
        entryType:   data.type        || 'journal',
        narration:   data.narration   || '',
        period:      data.period      || 'Q1 2026',
      };

    case 'imprest':
      return {
        date:     data.date,
        chq:      data.chq     || '',
        invoice:  data.invoice || '',
        payee:    data.payee,
        details:  data.details,
        category: data.category,
        amount:   parseFloat(data.amount) || 0,
        txType:   data.txtype  || 'payment',
        period:   data.period  || 'Q1 2026',
      };

    case 'production':
      return {
        date:         data.date,
        ref:          data.ref          || '',
        insurer:      data.insurer,
        insurerOther: data.insurerOther || '',
        product:      data.product      || 'Motor',
        period:       data.period       || 'Q1 2026 (Jan–Mar)',
        premium:      parseFloat(data.premium)  || 0,
        commission:   parseFloat(data.amount)   || 0,
        client:       data.client       || '',
      };

    case 'ar':
      return {
        date:               data.date,
        client:             data.client,
        insurer:            data.insurer      || '',
        product:            data.product      || 'Motor',
        currency:           data.currency     || 'GH¢',
        fxRate:             parseFloat(data.fxrate)     || 1,
        sumInsured:         parseFloat(data.suminsured) || 0,
        premium:            parseFloat(data.premium)    || 0,
        commission:         parseFloat(data.amount)     || 0,
        outstandingBalance: parseFloat(data.balance)    || 0,
        status:             data.status       || 'Pending',
      };

    case 'bank':
      return {
        date:          data.date,
        account:       data.account,
        currency:      data.currency || 'GH¢',
        fxRate:        parseFloat(data.fxrate)  || 1,
        amountForeign: parseFloat(data.amount)  || 0,
        amountGhc:     parseFloat(data.ghc) || parseFloat(data.amount) || 0,
        txType:        data.txtype   || 'Credit (Deposit)',
        ref:           data.ref      || '',
        notes:         data.notes    || '',
        period:        data.period   || 'Q1 2026',
      };

    case 'tb':
      return {
        particulars: data.particulars,
        debit:       parseFloat(data.debit)  || 0,
        credit:      parseFloat(data.credit) || 0,
        period:      data.period   || '2026',
        adjType:     data.adjtype  || 'Audit Adjustment',
        notes:       data.notes    || '',
      };

    default:
      return data;
  }
}

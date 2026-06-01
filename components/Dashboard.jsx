'use client';

import { useState, useCallback, useEffect } from 'react';
import { gc } from '@/lib/data';
import { exportAll, exportSection } from '@/lib/export';
import {
  auth,
  journal, imprest, production, ar, bank, trialBalance, financials,
  normalizeEntry, toApiPayload, normalizeFinancials,
  clearTokens,
} from '@/lib/api';

import Sidebar    from './Sidebar';
import Topbar     from './Topbar';
import PeriodBar  from './PeriodBar';
import Drawer     from './Drawer';
import Toast      from './Toast';
import LoginModal from './LoginModal';

import DashPanel         from './panels/DashPanel';
import AfsPanel          from './panels/AfsPanel';
import TrialBalancePanel from './panels/TrialBalancePanel';
import JournalPanel      from './panels/JournalPanel';
import ImprestPanel      from './panels/ImprestPanel';
import ProductionPanel   from './panels/ProductionPanel';
import ArPanel           from './panels/ArPanel';
import BankPanel         from './panels/BankPanel';
import OverdraftPanel    from './panels/OverdraftPanel';
import LoanPanel         from './panels/LoanPanel';
import TaxPanel          from './panels/TaxPanel';
import RatiosPanel       from './panels/RatiosPanel';
import NotesPanel        from './panels/NotesPanel';
import DirectorsPanel    from './panels/DirectorsPanel';

const TITLES = {
  dash:      'Dashboard',
  afs:       'AFS — P&L & Balance Sheet',
  tb:        'Trial Balance',
  je:        'Journal Entry',
  imprest:   'Imprest Cash Book',
  prod:      'Production (by Insurer)',
  ar:        'Accounts Receivables',
  bank:      'Bank Charges',
  overdraft: 'Overdraft Interest',
  loan:      'Loan Schedule',
  tax:       'Tax Credit (CIT/WHT)',
  ratios:    'Ratios Analysis',
  notes:     'Notes to Accounts',
  directors: 'Directors Report',
};

const INITIAL_DB = {
  journal: [], imprest: [], production: [], ar: [], bank: [], tb: [],
};

// Map dashboard period key → API period string (for Drawer default)
const PERIOD_DISPLAY = {
  q1: 'Q1 2026', q2: 'Q2 2026', q3: 'Q3 2026', q4: 'Q4 2026',
  fy: 'Full Year 2026', '6y': 'Full Year 2026', '6ytd': 'Full Year 2026',
};

const LOAD_CONFIG = [
  { key: 'journal',    api: journal,      type: 'journal' },
  { key: 'imprest',    api: imprest,      type: 'imprest' },
  { key: 'production', api: production,   type: 'production' },
  { key: 'ar',         api: ar,           type: 'ar' },
  { key: 'bank',       api: bank,         type: 'bank' },
  { key: 'tb',         api: trialBalance, type: 'tb' },
];

const API = {
  journal, imprest, production, ar, bank, tb: trialBalance,
};

export default function Dashboard() {
  const [curPanel,     setCurPanel]     = useState('dash');
  const [curPeriod,    setCurPeriod]    = useState('fy');
  const [drawerOpen,   setDrawerOpen]   = useState(false);
  const [curDrawer,    setCurDrawer]    = useState('');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [toast,      setToast]      = useState({ show: false, msg: '', type: 'success' });
  const [db,         setDb]         = useState(INITIAL_DB);

  // Financial data — fetched from API; null while loading
  const [fin,         setFin]         = useState(null);
  const [finLoading,  setFinLoading]  = useState(true);
  // Insurer reference data — fetched once, used by ProductionPanel for is6 view
  const [staticInsurers, setStaticInsurers] = useState(null);

  // Auth state
  const [user,        setUser]        = useState(null);
  const [loginOpen,   setLoginOpen]   = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [dbLoading,   setDbLoading]   = useState(false);

  // ─── Toasts ────────────────────────────────────────────────────────────────
  const showToast = useCallback((msg, type = 'success') => {
    setToast({ show: true, msg, type });
    setTimeout(() => setToast(t => ({ ...t, show: false })), 2800);
  }, []);

  // ─── Fetch financials for the active period ───────────────────────────────
  const loadFin = useCallback(async (period) => {
    setFinLoading(true);
    try {
      const raw = await financials.period(period);
      setFin(normalizeFinancials(raw));
    } catch (err) {
      if (err.status === 401) {
        // Token expired and refresh failed — force re-login
        setUser(null); setFin(null); setDb(INITIAL_DB); setLoginOpen(true);
      } else {
        showToast('⚠ Could not load financials: ' + err.message, 'error');
      }
    } finally {
      setFinLoading(false);
    }
  }, [showToast]);

  // ─── Load all db entries from backend ─────────────────────────────────────
  const loadAll = useCallback(async () => {
    setDbLoading(true);
    try {
      const results = await Promise.allSettled(LOAD_CONFIG.map(c => c.api.list()));
      const newDb   = {};
      let hadError  = false;

      LOAD_CONFIG.forEach((c, i) => {
        const r = results[i];
        if (r.status === 'fulfilled' && Array.isArray(r.value)) {
          newDb[c.key] = r.value.map(e => normalizeEntry(c.type, e));
        } else {
          newDb[c.key] = [];
          if (r.status === 'rejected') hadError = true;
        }
      });

      setDb(newDb);
      if (hadError) showToast('⚠ Some data failed to load. Check your connection.', 'error');
    } catch (err) {
      showToast('⚠ Could not load records: ' + err.message, 'error');
    } finally {
      setDbLoading(false);
    }
  }, [showToast]);

  // ─── Auth check on first mount ────────────────────────────────────────────
  useEffect(() => {
    auth.me()
      .then(u => {
        setUser(u);
        setAuthChecked(true);
        loadAll();
        loadFin('fy');
        financials.insurers().then(setStaticInsurers).catch(() => {});
      })
      .catch(() => {
        setAuthChecked(true);
        setFinLoading(false);
        setLoginOpen(true);
      });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Reload financials whenever the period changes ────────────────────────
  useEffect(() => {
    if (!user) return;
    loadFin(curPeriod);
  }, [curPeriod]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── After successful login ───────────────────────────────────────────────
  const handleLoginSuccess = useCallback((u) => {
    setUser(u);
    setLoginOpen(false);
    loadAll();
    loadFin(curPeriod);
    financials.insurers().then(setStaticInsurers).catch(() => {});
  }, [loadAll, loadFin, curPeriod]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Sign out ─────────────────────────────────────────────────────────────
  const handleSignOut = useCallback(async () => {
    try { await auth.signOut(); } catch { clearTokens(); }
    setUser(null);
    setFin(null);
    setDb(INITIAL_DB);
    setLoginOpen(true);
  }, []);

  // ─── Drawer helpers ───────────────────────────────────────────────────────
  const openDrawer  = useCallback((type) => { setCurDrawer(type); setDrawerOpen(true); }, []);
  const closeDrawer = useCallback(() => { setDrawerOpen(false); setCurDrawer(''); }, []);

  // ─── Save an entry via the API ────────────────────────────────────────────
  const handleSave = useCallback(async (type, formData) => {
    const payload = toApiPayload(type, formData);
    const created = await API[type].create(payload);
    const normalized = normalizeEntry(type, created);
    setDb(prev => ({ ...prev, [type]: [normalized, ...prev[type]] }));
    showToast('✓ Entry saved successfully');
    closeDrawer();
  }, [showToast, closeDrawer]);

  // ─── Export helpers ───────────────────────────────────────────────────────
  const handleExportAll = useCallback(async () => {
    await exportAll(db, fin);
    showToast('✓ All sheets exported to Excel');
  }, [db, fin, showToast]);

  const handleExportSection = useCallback(async (type) => {
    const ok = await exportSection(type, db);
    showToast(ok ? '✓ Exported to Excel' : '⚠ No data to export yet', ok ? 'success' : 'error');
  }, [db, showToast]);

  const pat             = fin ? (fin.is6 ? fin.d.net[5] : fin.pat) : 0;
  const retainedDeficit = fin
    ? Math.abs(fin.is6
        ? fin.balanceSheet.equity.retainedOpen + fin.d.net[5]
        : fin.reClose)
    : 0;
  const defaultPeriod   = PERIOD_DISPLAY[curPeriod] || 'Q1 2026';

  const loading = finLoading || !fin;

  // ─── Render ───────────────────────────────────────────────────────────────
  // Show only the login modal until authentication is confirmed
  if (!authChecked || loginOpen) {
    return (
      <div style={{ width: '100%', height: '100%' }}>
        {authChecked && loginOpen && (
          <LoginModal onSuccess={handleLoginSuccess} />
        )}
        {!authChecked && (
          <div style={{ display: 'flex', width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)', fontSize: 13 }}>
            Checking session…
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      <div style={{ display: 'flex', width: '100%', height: '100%', overflow: 'hidden' }}>
        {/* Mobile sidebar overlay — tap to close */}
        <div
          className={`sb-overlay${mobileNavOpen ? ' open' : ''}`}
          onClick={() => setMobileNavOpen(false)}
        />
        <Sidebar
          curPanel={curPanel}
          onNav={setCurPanel}
          isOpen={mobileNavOpen}
          onClose={() => setMobileNavOpen(false)}
        />

        <div className="main">
          <Topbar
            title={TITLES[curPanel]}
            retainedDeficit={retainedDeficit}
            pat={pat}
            onExportAll={handleExportAll}
            user={user}
            onSignOut={handleSignOut}
            onMenuOpen={() => setMobileNavOpen(true)}
          />
          <PeriodBar curPeriod={curPeriod} onSetPeriod={setCurPeriod} />

          {loading ? (
            <div style={{ padding: '24px', fontSize: 13, color: 'var(--muted)' }}>
              Loading financials…
            </div>
          ) : (
            <div className="content">
              {curPanel === 'dash'      && <DashPanel      fin={fin} />}
              {curPanel === 'afs'       && <AfsPanel       fin={fin} />}
              {curPanel === 'tb'        && <TrialBalancePanel fin={fin} db={db} onOpenDrawer={openDrawer} onExport={handleExportAll} />}
              {curPanel === 'je'        && <JournalPanel   fin={fin} db={db} onOpenDrawer={openDrawer} onExport={() => handleExportSection('journal')} />}
              {curPanel === 'imprest'   && <ImprestPanel   fin={fin} db={db} onOpenDrawer={openDrawer} onExport={() => handleExportSection('imprest')} />}
              {curPanel === 'prod'      && <ProductionPanel fin={fin} db={db} onOpenDrawer={openDrawer} onExport={() => handleExportSection('production')} staticInsurers={staticInsurers} />}
              {curPanel === 'ar'        && <ArPanel        fin={fin} db={db} onOpenDrawer={openDrawer} onExport={() => handleExportSection('ar')} />}
              {curPanel === 'bank'      && <BankPanel      fin={fin} db={db} onOpenDrawer={openDrawer} onExport={() => handleExportSection('bank')} />}
              {curPanel === 'overdraft' && <OverdraftPanel fin={fin} />}
              {curPanel === 'loan'      && <LoanPanel      fin={fin} />}
              {curPanel === 'tax'       && <TaxPanel       fin={fin} />}
              {curPanel === 'ratios'    && <RatiosPanel    fin={fin} />}
              {curPanel === 'notes'     && <NotesPanel     fin={fin} />}
              {curPanel === 'directors' && <DirectorsPanel />}
            </div>
          )}
        </div>

        <Drawer
          isOpen={drawerOpen}
          type={curDrawer}
          defaultPeriod={defaultPeriod}
          onClose={closeDrawer}
          onSave={handleSave}
        />

        <Toast show={toast.show} msg={toast.msg} type={toast.type} />
      </div>
    </>
  );
}

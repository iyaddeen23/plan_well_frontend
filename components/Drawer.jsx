'use client';
import { useState, useEffect } from 'react';

const FORM_META = {
  journal:    { title: 'Add Journal Entry',            sub: 'Post a new debit/credit entry to the journal' },
  imprest:    { title: 'Add Imprest Transaction',      sub: 'Record a petty cash receipt or payment' },
  production: { title: 'Add Production Entry',         sub: 'Record commission earned from an insurer' },
  ar:         { title: 'Add Accounts Receivable',      sub: 'Record a new outstanding commission or premium' },
  bank:       { title: 'Add Bank Transaction',         sub: 'Record a bank entry or reconciliation item' },
  tb:         { title: 'Add Trial Balance Adjustment', sub: 'Post an adjustment to the trial balance' },
};

const STD_PERIODS = ['Q1 2026', 'Q2 2026', 'Q3 2026', 'Q4 2026', 'Full Year 2026'];

// ─── Journal ──────────────────────────────────────────────────────────────────
function JournalForm({ data, onChange, defaultPeriod }) {
  return (
    <>
      <div className="fg-row">
        <div className="fg">
          <label>Date <span className="req">*</span></label>
          <input className="fi" type="date" value={data.date || new Date().toISOString().slice(0, 10)} onChange={e => onChange('date', e.target.value)} />
        </div>
        <div className="fg">
          <label>Reference No. <span className="req">*</span></label>
          <input className="fi" type="text" placeholder="JNL-2026-001" value={data.ref || ''} onChange={e => onChange('ref', e.target.value)} />
        </div>
      </div>
      <div className="fg">
        <label>Particulars <span className="req">*</span></label>
        <input className="fi" type="text" placeholder="e.g. Depreciation charge — Motor Vehicles" value={data.particulars || ''} onChange={e => onChange('particulars', e.target.value)} />
      </div>
      <div className="fg-row">
        <div className="fg">
          <label>Debit Account <span className="req">*</span></label>
          <select className="fi fi-select" value={data.dr || ''} onChange={e => onChange('dr', e.target.value)}>
            <option value="">Select account...</option>
            {['Depreciation Expense','Salaries & Allowances','Business Promotion','Rent & Occupancy','Utilities','Bank Charges','Finance Charges','Fuel & Lubricants','Motor Vehicles (Asset)','Cash at Bank','Commissions Receivable','Income Tax Expense','Other Expense'].map(o => <option key={o}>{o}</option>)}
          </select>
        </div>
        <div className="fg">
          <label>Credit Account <span className="req">*</span></label>
          <select className="fi fi-select" value={data.cr || ''} onChange={e => onChange('cr', e.target.value)}>
            <option value="">Select account...</option>
            {['Accumulated Depreciation — Motor Vehicles','Accumulated Depreciation — Plant & Machinery','Accumulated Depreciation — Furniture','Accumulated Depreciation — Computer','Amortisation — Intangibles','Accrual Liabilities','Cash at Bank','Commission Revenue','Investment Income','Income Tax Payable','Trade Creditors','Other Income'].map(o => <option key={o}>{o}</option>)}
          </select>
        </div>
      </div>
      <div className="fg-row">
        <div className="fg">
          <label>Amount (GH¢) <span className="req">*</span></label>
          <input className="fi" type="number" placeholder="0.00" step="0.01" value={data.amount || ''} onChange={e => onChange('amount', e.target.value)} />
        </div>
        <div className="fg">
          <label>Entry type</label>
          <select className="fi fi-select" value={data.type || 'journal'} onChange={e => onChange('type', e.target.value)}>
            <option value="journal">Journal Entry</option>
            <option value="adjustment">Audit Adjustment</option>
            <option value="correction">Correction</option>
          </select>
        </div>
      </div>
      <div className="fg">
        <label>Period <span className="req">*</span></label>
        <select className="fi fi-select" value={data.period || defaultPeriod || 'Q1 2026'} onChange={e => onChange('period', e.target.value)}>
          {STD_PERIODS.map(o => <option key={o}>{o}</option>)}
        </select>
      </div>
      <div className="fg">
        <label>Narration</label>
        <textarea className="fi" rows="3" placeholder="Explain the purpose of this entry…" value={data.narration || ''} onChange={e => onChange('narration', e.target.value)} />
      </div>
    </>
  );
}

// ─── Imprest ──────────────────────────────────────────────────────────────────
function ImprestForm({ data, onChange, defaultPeriod }) {
  return (
    <>
      <div className="fg-row">
        <div className="fg">
          <label>Date <span className="req">*</span></label>
          <input className="fi" type="date" value={data.date || new Date().toISOString().slice(0, 10)} onChange={e => onChange('date', e.target.value)} />
        </div>
        <div className="fg">
          <label>CHQ / Voucher No.</label>
          <input className="fi" type="text" placeholder="CHQ-001" value={data.chq || ''} onChange={e => onChange('chq', e.target.value)} />
        </div>
      </div>
      <div className="fg-row">
        <div className="fg">
          <label>Invoice No.</label>
          <input className="fi" type="text" placeholder="INV-2026-001" value={data.invoice || ''} onChange={e => onChange('invoice', e.target.value)} />
        </div>
        <div className="fg">
          <label>Payee Name <span className="req">*</span></label>
          <input className="fi" type="text" placeholder="Supplier / Staff name" value={data.payee || ''} onChange={e => onChange('payee', e.target.value)} />
        </div>
      </div>
      <div className="fg">
        <label>Description <span className="req">*</span></label>
        <input className="fi" type="text" placeholder="e.g. Fuel for office vehicle" value={data.details || ''} onChange={e => onChange('details', e.target.value)} />
      </div>
      <div className="fg-row">
        <div className="fg">
          <label>Category <span className="req">*</span></label>
          <select className="fi fi-select" value={data.category || ''} onChange={e => onChange('category', e.target.value)}>
            <option value="">Select…</option>
            {['Printing & Stationery','Communication','Utilities','Levies & Licensing','Fuel & Lubricants','Travelling & Transport','Repairs & Maintenance','Rent & Occupancy','Refreshment & Entertainment','Office Supplies','MOMO Charge','Commission Allowance'].map(o => <option key={o}>{o}</option>)}
          </select>
        </div>
        <div className="fg">
          <label>Amount (GH¢) <span className="req">*</span></label>
          <input className="fi" type="number" placeholder="0.00" step="0.01" value={data.amount || ''} onChange={e => onChange('amount', e.target.value)} />
        </div>
      </div>
      <div className="fg-row">
        <div className="fg">
          <label>Transaction type</label>
          <select className="fi fi-select" value={data.txtype || 'payment'} onChange={e => onChange('txtype', e.target.value)}>
            <option value="payment">Payment (Cash Out)</option>
            <option value="receipt">Receipt (Cash In)</option>
          </select>
        </div>
        <div className="fg">
          <label>Period <span className="req">*</span></label>
          <select className="fi fi-select" value={data.period || defaultPeriod || 'Q1 2026'} onChange={e => onChange('period', e.target.value)}>
            {STD_PERIODS.map(o => <option key={o}>{o}</option>)}
          </select>
        </div>
      </div>
    </>
  );
}

// ─── Production ───────────────────────────────────────────────────────────────
function ProductionForm({ data, onChange }) {
  return (
    <>
      <div className="fg-row">
        <div className="fg">
          <label>Date <span className="req">*</span></label>
          <input className="fi" type="date" value={data.date || new Date().toISOString().slice(0, 10)} onChange={e => onChange('date', e.target.value)} />
        </div>
        <div className="fg">
          <label>Reference / Policy No.</label>
          <input className="fi" type="text" placeholder="POL-2026-XXXX" value={data.ref || ''} onChange={e => onChange('ref', e.target.value)} />
        </div>
      </div>
      <div className="fg">
        <label>Insurer Name <span className="req">*</span></label>
        <select className="fi fi-select" value={data.insurer || ''} onChange={e => onChange('insurer', e.target.value)}>
          <option value="">Select insurer…</option>
          {['Enterprise Insurance Company','Serene Insurance Company','Enterprise Life Insurance Company','Provident Insurance Company','Allianz Life Insurance Company','Coronation Insurance Company','Vanguard Insurance Company','Phoenix Insurance Company','GLICO Insurance Company','State Insurance Company PLC','Loyalty Insurance Company','Star Insurance Company','Quality Insurance Company','Donewell Insurance Company','MiLife Insurance Company','MetLife Insurance Company','Hollard Insurance Company','Priority Insurance Company','SUNU Insurance Company','Other (specify below)'].map(o => <option key={o}>{o}</option>)}
        </select>
      </div>
      {data.insurer === 'Other (specify below)' && (
        <div className="fg">
          <label>Other insurer name</label>
          <input className="fi" type="text" placeholder="Enter insurer name" value={data.insurerOther || ''} onChange={e => onChange('insurerOther', e.target.value)} />
        </div>
      )}
      <div className="fg-row">
        <div className="fg">
          <label>Product Line <span className="req">*</span></label>
          <select className="fi fi-select" value={data.product || 'Motor'} onChange={e => onChange('product', e.target.value)}>
            {['Motor','Fire, Theft & Property','Life Insurance','Financial Guarantees & Bonds','Engineering','Marine & Aviation','Liability','Personal Accident & Health','Other Short Term'].map(o => <option key={o}>{o}</option>)}
          </select>
        </div>
        <div className="fg">
          <label>Period / Quarter</label>
          <select className="fi fi-select" value={data.period || 'Q1 2026 (Jan–Mar)'} onChange={e => onChange('period', e.target.value)}>
            {['Q1 2026 (Jan–Mar)','Q2 2026 (Apr–Jun)','Q3 2026 (Jul–Sep)','Q4 2026 (Oct–Dec)','Full Year 2026'].map(o => <option key={o}>{o}</option>)}
          </select>
        </div>
      </div>
      <div className="fg-row">
        <div className="fg">
          <label>Premium (GH¢)</label>
          <input className="fi" type="number" placeholder="0.00" value={data.premium || ''} onChange={e => onChange('premium', e.target.value)} />
        </div>
        <div className="fg">
          <label>Commission (GH¢) <span className="req">*</span></label>
          <input className="fi" type="number" placeholder="0.00" step="0.01" value={data.amount || ''} onChange={e => onChange('amount', e.target.value)} />
        </div>
      </div>
      <div className="fg">
        <label>Client name (optional)</label>
        <input className="fi" type="text" placeholder="e.g. Kofi Mensah / ABC Ltd" value={data.client || ''} onChange={e => onChange('client', e.target.value)} />
      </div>
    </>
  );
}

// ─── Accounts Receivable ──────────────────────────────────────────────────────
function ArForm({ data, onChange }) {
  return (
    <>
      <div className="fg-row">
        <div className="fg">
          <label>Date <span className="req">*</span></label>
          <input className="fi" type="date" value={data.date || new Date().toISOString().slice(0, 10)} onChange={e => onChange('date', e.target.value)} />
        </div>
        <div className="fg">
          <label>Client Name <span className="req">*</span></label>
          <input className="fi" type="text" placeholder="Client or company name" value={data.client || ''} onChange={e => onChange('client', e.target.value)} />
        </div>
      </div>
      <div className="fg-row">
        <div className="fg">
          <label>Insurer</label>
          <input className="fi" type="text" placeholder="Insurer name" value={data.insurer || ''} onChange={e => onChange('insurer', e.target.value)} />
        </div>
        <div className="fg">
          <label>Product</label>
          <select className="fi fi-select" value={data.product || 'Motor'} onChange={e => onChange('product', e.target.value)}>
            {['Motor','Fire & Property','Life','Engineering','Bonds','Marine','Other'].map(o => <option key={o}>{o}</option>)}
          </select>
        </div>
      </div>
      <div className="fg-row3">
        <div className="fg">
          <label>Currency</label>
          <select className="fi fi-select" value={data.currency || 'GH¢'} onChange={e => onChange('currency', e.target.value)}>
            {['GH¢','USD','EUR','GBP'].map(o => <option key={o}>{o}</option>)}
          </select>
        </div>
        <div className="fg">
          <label>FX Rate</label>
          <input className="fi" type="number" placeholder="1.00" step="0.0001" value={data.fxrate || '1'} onChange={e => onChange('fxrate', e.target.value)} />
        </div>
        <div className="fg">
          <label>Sum Insured</label>
          <input className="fi" type="number" placeholder="0" value={data.suminsured || ''} onChange={e => onChange('suminsured', e.target.value)} />
        </div>
      </div>
      <div className="fg-row">
        <div className="fg">
          <label>Premium (GH¢) <span className="req">*</span></label>
          <input className="fi" type="number" placeholder="0.00" value={data.premium || ''} onChange={e => onChange('premium', e.target.value)} />
        </div>
        <div className="fg">
          <label>Commission (GH¢)</label>
          <input className="fi" type="number" placeholder="0.00" value={data.amount || ''} onChange={e => onChange('amount', e.target.value)} />
        </div>
      </div>
      <div className="fg-row">
        <div className="fg">
          <label>Outstanding Balance (GH¢) <span className="req">*</span></label>
          <input className="fi" type="number" placeholder="0.00" value={data.balance || ''} onChange={e => onChange('balance', e.target.value)} />
        </div>
        <div className="fg">
          <label>Status</label>
          <select className="fi fi-select" value={data.status || 'Pending'} onChange={e => onChange('status', e.target.value)}>
            {['Pending','Partial','Collected','Disputed'].map(o => <option key={o}>{o}</option>)}
          </select>
        </div>
      </div>
    </>
  );
}

// ─── Bank ─────────────────────────────────────────────────────────────────────
function BankForm({ data, onChange, defaultPeriod }) {
  const calcGhc = (amount, fxrate) => {
    const a = parseFloat(amount || 0);
    const r = parseFloat(fxrate || 1);
    return (a * r).toFixed(2);
  };

  return (
    <>
      <div className="fg-row">
        <div className="fg">
          <label>Transaction Date <span className="req">*</span></label>
          <input className="fi" type="date" value={data.date || new Date().toISOString().slice(0, 10)} onChange={e => onChange('date', e.target.value)} />
        </div>
        <div className="fg">
          <label>Account <span className="req">*</span></label>
          <select className="fi fi-select" value={data.account || ''} onChange={e => onChange('account', e.target.value)}>
            <option value="">Select…</option>
            {['Fidelity Bank USD — Acct 11','Fidelity Bank USD — FBL 19','Ecobank GH¢','Ecobank EUR'].map(o => <option key={o}>{o}</option>)}
          </select>
        </div>
      </div>
      <div className="fg-row">
        <div className="fg">
          <label>Currency</label>
          <select className="fi fi-select" value={data.currency || 'GH¢'} onChange={e => onChange('currency', e.target.value)}>
            {['GH¢','USD','EUR'].map(o => <option key={o}>{o}</option>)}
          </select>
        </div>
        <div className="fg">
          <label>FX Rate</label>
          <input className="fi" type="number" placeholder="1.00" step="0.0001" value={data.fxrate || '1'}
            onChange={e => { onChange('fxrate', e.target.value); onChange('ghc', calcGhc(data.amount, e.target.value)); }} />
        </div>
      </div>
      <div className="fg-row">
        <div className="fg">
          <label>Amount (foreign) <span className="req">*</span></label>
          <input className="fi" type="number" placeholder="0.00" value={data.amount || ''}
            onChange={e => { onChange('amount', e.target.value); onChange('ghc', calcGhc(e.target.value, data.fxrate)); }} />
        </div>
        <div className="fg">
          <label>GH¢ Equivalent</label>
          <input className="fi" type="number" placeholder="Auto-calc" readOnly style={{ background: '#F9F9F7' }} value={data.ghc || ''} />
        </div>
      </div>
      <div className="fg-row">
        <div className="fg">
          <label>Transaction type</label>
          <select className="fi fi-select" value={data.txtype || 'Credit (Deposit)'} onChange={e => onChange('txtype', e.target.value)}>
            {['Credit (Deposit)','Debit (Withdrawal)','Bank Charge','Interest Charged'].map(o => <option key={o}>{o}</option>)}
          </select>
        </div>
        <div className="fg">
          <label>Reference</label>
          <input className="fi" type="text" placeholder="Bank ref / CHQ no." value={data.ref || ''} onChange={e => onChange('ref', e.target.value)} />
        </div>
      </div>
      <div className="fg-row">
        <div className="fg">
          <label>Period <span className="req">*</span></label>
          <select className="fi fi-select" value={data.period || defaultPeriod || 'Q1 2026'} onChange={e => onChange('period', e.target.value)}>
            {STD_PERIODS.map(o => <option key={o}>{o}</option>)}
          </select>
        </div>
        <div className="fg">
          <label>Notes</label>
          <input className="fi" type="text" placeholder="Brief description" value={data.notes || ''} onChange={e => onChange('notes', e.target.value)} />
        </div>
      </div>
    </>
  );
}

// ─── Trial Balance ────────────────────────────────────────────────────────────
function TbForm({ data, onChange }) {
  return (
    <>
      <div className="fg">
        <label>Account / Particulars <span className="req">*</span></label>
        <input className="fi" type="text" placeholder="e.g. Accrued Audit Fees" value={data.particulars || ''} onChange={e => onChange('particulars', e.target.value)} />
      </div>
      <div className="fg-row">
        <div className="fg">
          <label>Debit (GH¢)</label>
          <input className="fi" type="number" placeholder="0.00" step="0.01" value={data.debit || ''} onChange={e => onChange('debit', e.target.value)} />
        </div>
        <div className="fg">
          <label>Credit (GH¢)</label>
          <input className="fi" type="number" placeholder="0.00" step="0.01" value={data.credit || ''} onChange={e => onChange('credit', e.target.value)} />
        </div>
      </div>
      <div className="fg-row">
        <div className="fg">
          <label>Period</label>
          <select className="fi fi-select" value={data.period || '2026'} onChange={e => onChange('period', e.target.value)}>
            {['2026','2025','Both'].map(o => <option key={o}>{o}</option>)}
          </select>
        </div>
        <div className="fg">
          <label>Adjustment type</label>
          <select className="fi fi-select" value={data.adjtype || 'Audit Adjustment'} onChange={e => onChange('adjtype', e.target.value)}>
            {['Audit Adjustment','Journal Entry','Reclassification','Accrual'].map(o => <option key={o}>{o}</option>)}
          </select>
        </div>
      </div>
      <div className="fg">
        <label>Notes / Narration</label>
        <textarea className="fi" rows="2" placeholder="Reason for this adjustment…" value={data.notes || ''} onChange={e => onChange('notes', e.target.value)} />
      </div>
    </>
  );
}

const FORM_COMPONENTS = {
  journal:    JournalForm,
  imprest:    ImprestForm,
  production: ProductionForm,
  ar:         ArForm,
  bank:       BankForm,
  tb:         TbForm,
};

// ─── Drawer shell ─────────────────────────────────────────────────────────────
export default function Drawer({ isOpen, type, defaultPeriod, onClose, onSave }) {
  const [formData, setFormData] = useState({});
  const [saving,   setSaving]   = useState(false);
  const [saveErr,  setSaveErr]  = useState('');

  useEffect(() => {
    if (isOpen) { setFormData({}); setSaveErr(''); }
  }, [isOpen, type]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    const amount = formData.amount || formData.credit || formData.balance;
    if (!amount) {
      setSaveErr('Please enter an amount.');
      return;
    }
    setSaveErr('');
    setSaving(true);
    try {
      await onSave(type, { ...formData });
      // onSave closes the drawer on success, so nothing more needed here
    } catch (err) {
      // onSave already showed a toast; keep drawer open so user can fix data
      setSaveErr(err.message || 'Save failed — please check the fields and try again.');
    } finally {
      setSaving(false);
    }
  };

  const meta = FORM_META[type] || { title: 'Add Entry', sub: 'Fill in the details below' };
  const FormComponent = FORM_COMPONENTS[type];

  return (
    <>
      <div className={`drawer-overlay${isOpen ? ' open' : ''}`} onClick={onClose} />
      <div className={`drawer${isOpen ? ' open' : ''}`}>
        <div className="drawer-head">
          <div>
            <div className="drawer-title">{meta.title}</div>
            <div className="drawer-sub">{meta.sub}</div>
          </div>
          <button className="drawer-close" onClick={onClose}>×</button>
        </div>

        <div className="drawer-body">
          {FormComponent && (
            <FormComponent
              data={formData}
              onChange={handleChange}
              defaultPeriod={defaultPeriod}
            />
          )}

          {saveErr && (
            <div style={{
              marginTop: 12, padding: '10px 14px',
              background: '#FEF2F2', border: '1px solid #FECACA',
              color: '#B91C1C', borderRadius: 8, fontSize: 13,
            }}>
              ⚠ {saveErr}
            </div>
          )}
        </div>

        <div className="drawer-foot">
          <button className="btn btn-g" onClick={onClose} disabled={saving}>Cancel</button>
          <button
            className="btn-add"
            onClick={handleSave}
            disabled={saving}
            style={{ opacity: saving ? 0.7 : 1, cursor: saving ? 'not-allowed' : 'pointer' }}
          >
            {saving ? 'Saving…' : 'Save Entry'}
          </button>
        </div>
      </div>
    </>
  );
}

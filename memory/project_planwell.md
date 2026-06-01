---
name: project-planwell-nextjs
description: Planwell accounting admin dashboard — converted from single HTML file to Next.js 14 App Router project
metadata:
  type: project
---

Planwell Insurance Brokers Limited admin dashboard. Converted from `Planwell_Admin_Dashboard (1).html` (1714-line single HTML file) to a full Next.js 14 App Router project (JavaScript, no TypeScript).

**Why:** User requested full Next.js conversion of the HTML file.

**How to apply:** Project lives at `c:\Users\LENOVO\Desktop\Vscode\websites\planwell_accounting`. Run with `npm run dev`.

## Structure
- `app/` — layout.js, page.js, globals.css
- `lib/data.js` — financial data constants (Q, FY, SIX_YEARS, SIX_YTD) + `computeFinancials(period)`
- `lib/export.js` — XLSX export (dynamic import of xlsx)
- `components/Dashboard.jsx` — main `'use client'` state container
- `components/panels/` — 14 panel components (DashPanel, AfsPanel, TrialBalancePanel, JournalPanel, ImprestPanel, ProductionPanel, ArPanel, BankPanel, OverdraftPanel, LoanPanel, TaxPanel, RatiosPanel, NotesPanel, DirectorsPanel)
- `public/logo.png` — extracted from original base64 in HTML

## Dependencies
chart.js@4.4.0, react-chartjs-2@5.2.0, xlsx@0.18.5, next@14.2.29

## Notes
- CSS is preserved verbatim from original (CSS custom properties)
- Chart.js registered in DashPanel.jsx (idempotent, applies globally)
- All periods handled: q1/q2/q3/q4/fy (regular) and 6y/6ytd (6-year trend, changes chart types to Line)
- Build passes: `npm run build` ✓

# Feature: Interactive L2 Dashboard with Resilient Data Ingestion

## 1. Feature Specification
- **ID:** FEAT-001
- **Title:** Executive L2 Operations Dashboard with Dynamic Excel Ingestion
- **Target Environment:** Local dev server (`http://localhost:5173`), prepared for 100% free static deployment (Vercel / Netlify / GitHub Pages).
- **Core Requirements:**
  1. Executive KPIs (₹40.50 Cr, 2,688 tickets, Avg ticket ₹1.51 L, SLA TAT 0.6 days).
  2. Dual-Stream Hierarchy:
     - 4 Senior Managers ONLY (Niladri Bhadra, Surajit Laha, Arijit Nath, Amit Singal).
     - Physical Teams (NO CAPTAIN): `<Manager Name> - Physical Team`, badged `No Captain • Direct Supervision`.
     - Digital Teams (CAPTAIN-LED): Led by 7 dedicated Pod Captains.
  3. Dedicated Invoice Audit PODs: Auditable (1,925 tickets | ₹29.72 Cr) vs Non-Auditable (763 tickets | ₹10.78 Cr) with 1-click filtering.
  4. 1-click Light/Dark Mode toggle in the navbar with CenturyPly Option 2 enterprise design (signature Century Red `#E31E24`, slate/navy, monogram badges, no photos, no external logo).
  5. L2 Approver Workloads (8 Reviewers) & Turnaround Time (TAT) metrics.
  6. Daily approval velocity bar chart & channel breakdown (CenturyJoy vs. CenturyJoyApp).
  7. Searchable, filterable, and paginated Ticket Explorer with CSV export.
  8. Resilient Ingestion Section: Drag-and-drop Excel/CSV upload with fuzzy header matching, fallback column mapper modal, data normalizer, and replace/append options.
  9. Strict Watermark & Anti-Tamper Protocol (Rule 19): Hover-only visibility, continuous DOM watcher, coupled kill switch.

## 2. Approach & Rationale ("Why Before What")
- **Framework:** Vite + React + Tailwind CSS + Lucide Icons + Recharts / Chart.js.
  - *Why:* Instant build, zero runtime backend cost, sub-millisecond filtering on 2,688+ records, pure static output ready for immediate hosting.
- **Data Ingestion:** Client-side SheetJS (`xlsx`) library.
  - *Why:* Operates offline and in-browser without sending sensitive financial CRM data to third-party upload servers.
- **Security:** Defensive sanitization against formula injection (`=cmd|'`) and strict schema type casting.

## 3. Implementation Steps
1. Create `process_data.py` to compile initial `data.json` and `hierarchy.json`.
2. Scaffold Vite + React + Tailwind app structure.
3. Implement `integrity.js` and `Watermark.jsx` with coupled kill-switch.
4. Implement `columnMatcher.js` and `UploadModal.jsx` for resilient file ingestion.
5. Implement KPI summary, hierarchy drilldown, L2 workload, and Ticket Explorer components.
6. Verify locally via automated checks and launch local server.

## 4. Verification & Testing
- Automated test script validating record counts, sum totals, hierarchy match rates, and column matcher aliases:
  - Total records: `2,688`
  - Total amount: `₹404,977,923.49`
  - Hierarchy matched: `2,688 (100.00%)` (0 Unassigned)
  - Senior Managers: `4` (Niladri Bhadra, Surajit Laha, Arijit Nath, Amit Singal)
  - Auditable Invoices POD: `1,925 tickets (₹29.72 Cr)`
  - Non-Auditable Invoices POD: `763 tickets (₹10.78 Cr)`
  - Digital Pods: `7 Captains` | Physical Teams: `4 Teams (Direct Supervision)`
- Production build verified: `npm run build` generated `dist/` successfully with 0 errors.
- Local server active: `http://localhost:5173/` tested and responding with HTTP 200.
- Anti-tamper watermark & coupled integrity verification active.

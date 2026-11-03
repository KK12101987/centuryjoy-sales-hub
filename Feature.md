# Feature: Interactive L2 Dashboard with Resilient Data Ingestion

## 1. Feature Specification
- **ID:** FEAT-001
- **Title:** Executive L2 Operations Dashboard with Dynamic Excel Ingestion
- **Target Environment:** Local dev server (`http://localhost:5173`), prepared for 100% free static deployment (Vercel / Netlify / GitHub Pages).
- **Core Requirements:**
  1. Executive KPIs (₹40.50 Cr, 2,688 tickets, Avg ticket, Active Reviewers).
  2. Hierarchical Drilldown: Senior Manager (Surajit, Niladri, Arijit, Amit) $\rightarrow$ Captains $\rightarrow$ RMs.
  3. L2 Approver Workloads (Kushal, Tanmoy, Dhriti, Nabonita, etc.) & Turnaround Time (TAT) metrics.
  4. Daily approval trend chart & channel breakdown (CenturyJoy vs. CenturyJoyApp).
  5. Searchable, filterable, and paginated Ticket Explorer with CSV export.
  6. Resilient Ingestion Section: Drag-and-drop Excel/CSV upload with fuzzy header matching, fallback column mapper modal, data normalizer, and replace/append options.
  7. Strict Watermark & Anti-Tamper Protocol (Rule 19): Hover-only visibility, continuous DOM watcher, coupled kill switch.

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
- Automated test script validating record counts, sum totals, hierarchy match rates, and column matcher aliases.
- Manual verification in browser at `http://localhost:5173`.

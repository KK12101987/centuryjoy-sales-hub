# Architectural & Design Decisions

## Decision 001: Initial Dataset Discovery & Baseline Ingestion
- **Date:** 2026-11-03
- **Model:** Gemini 3.8 Flash (High)
- **Status:** Superseded by Decision 002
- **Context:**
  Initially evaluated two workbooks: `L2 data_Oct'26.xlsx` and `AID Performance (Revenue) YTD Oct'26.xlsx`.

## Decision 002: Scope Restriction Exclusively to L2 Data
- **Date:** 2026-11-03
- **Model:** Gemini 3.8 Flash (High)
- **Status:** Approved
- **Context:**
  User directed to disregard `AID Performance (Revenue) YTD Oct'26.xlsx`.
- **Decision:**
  - Scope the entire project strictly and exclusively to `L2 data_Oct'26.xlsx`.
  - Exclude all data structures, models, and references related to `AID Performance (Revenue) YTD Oct'26.xlsx`.
- **Consequences:**
  - Streamlines data pipeline and focuses metrics solely on L2 approval throughput, reviewer workloads, team performances, turnaround time (TAT), auditability classifications, and daily approval trends for October 2026.

## Decision 003: Integration of RM Hierarchy Mapping (`RM_Cap_MGR.xlsx`)
- **Date:** 2026-11-03
- **Model:** Gemini 3.8 Flash (High)
- **Status:** Approved
- **Context:**
  User provided `RM_Cap_MGR.xlsx` containing 84 relationship managers mapped to 10 captains and 4 senior managers (Surajit Laha, Niladri Bhadra, Arijit Nath, Amit Singal).
- **Decision:**
  - Ingest `RM_Cap_MGR.xlsx` as an authoritative hierarchy mapping layer for the L2 Dashboard.
  - Implement case-insensitive and honorific/whitespace normalization (plus minor alias handling) to achieve a 99.93% (2,686 / 2,688 tickets) join rate with `Relationship Manager` in `L2 data_Oct'26.xlsx`.
- **Consequences:**
  - Enables executive drilldowns: Manager Level -> Captain Level -> RM Level -> Ticket Level.

## Decision 004: Local-First React Architecture with Dynamic In-Browser Ingestion
- **Date:** 2026-11-03
- **Model:** Gemini 3.8 Flash (High)
- **Status:** Approved
- **Context:**
  User wants to run the dashboard locally first, then host it globally for free. Furthermore, backend operators will upload new L2 data that may vary in header names and formatting.
- **Decision:**
  - Build a client-side Single Page Application (SPA) using Vite, React, Tailwind CSS, Lucide Icons, and SheetJS.
  - Pre-bundle October 2026 data and hierarchy so the dashboard works out of the box with zero configuration.
  - Build an in-browser upload module with a 4-layer fuzzy column matcher, live fallback column mapper modal, and data normalizer.
  - Keep the app 100% static so that running locally requires only `npm run dev`, and subsequent global hosting on Vercel/Netlify/GitHub Pages is 100% free with zero backend maintenance.
- **Consequences:**
  - Zero ongoing server hosting fees.
  - Immediate local development and testing.
  - Secure offline processing of uploaded Excel files without uploading sensitive CRM data to external cloud parsers.

## Decision 005: 100% Hierarchy Reconciliation (Silpa Palchina Pod)
- **Date:** 2026-11-03
- **Model:** Gemini 3.8 Flash (High)
- **Status:** Approved
- **Context:**
  Two tickets (totaling ₹2.13 L) were under "Unassigned / Other" because `Silpa Palchina` and `RONIKA BANERJEE` were not listed in the 84-member `RM_Cap_MGR.xlsx` table.
- **Decision:**
  - Map `Silpa Palchina` as Pod Captain and `RONIKA BANERJEE` as Relationship Manager under Senior Manager **Arijit Nath**, as confirmed by the organizational team structure in `New JOY Digital and Physical Team Mapping wef 1st October 2026.xlsx`.
- **Consequences:**
  - Achieved a **100.00% complete match (2,688 / 2,688 tickets)**.
  - Completely eliminated the "Unassigned / Other" card from the executive dashboard.
  - Arijit Nath's verified totals updated to 634 tickets | ₹11.03 Cr (27.2% revenue share).

## Decision 006: Dual-Stream Hierarchy, Dedicated Audit PODs & 1-Click Light/Dark Mode
- **Date:** 2026-11-03
- **Model:** Gemini 3.8 Flash (High)
- **Status:** Approved
- **Context:**
  User provided crucial business operational clarity:
  1. The 4 individuals (Niladri Bhadra, Surajit Laha, Arijit Nath, Amit Singal) are Senior Managers only, NOT captains.
  2. Each manager has a Physical Team (NO captain, direct manager supervision, labeled `<Manager> - Physical Team`) and Digital Teams (led by dedicated Pod Captains).
  3. UI must follow Option 2 (CenturyPly branding with Century Red `#E31E24` accents, monogram initial chips, zero photos, no external logo).
  4. Provide dedicated PODs for Auditable (1,925 tickets | ₹29.72 Cr) vs Non-Auditable (763 tickets | ₹10.78 Cr) invoices.
  5. Provide a 1-click Light/Dark Mode toggle in the navbar.
- **Decision:**
  - Implement full dual-stream architecture with segmented filters (`All Operations`, `Digital Stream`, `Physical Stream`).
  - Implement dedicated Auditable vs Non-Auditable Pod widgets with 1-click filtering.
  - Implement `tailwind.config.js` with `darkMode: 'class'` and add interactive Sun/Moon theme toggle in `Navbar.jsx`.
- **Consequences:**
  - High-impact institutional corporate UI with instant stream segregation and compliance visibility.
  - 100% verified against Rule 19 watermark integrity.

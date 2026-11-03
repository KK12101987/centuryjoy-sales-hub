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

# Bug Tracking & Resolution Trace

## BUG-001: Relative Import Depth in Migrated L2 Components
* **Status:** RESOLVED
* **Found During:** Vite initial build attempt
* **Description:** Moving components into `src/components/L2Dashboard/` increased directory nesting level. Imports like `../context/DataContext` failed because they needed `../../context/DataContext`.
* **Resolution:** Safely parsed all `.jsx` files in `src/components/L2Dashboard/` and normalized all relative context, utils, and data imports.
* **Verification:** `npm run build` executed and succeeded with 0 errors.

## BUG-002: Potential Client-Side Role Tampering (Escalation)
* **Status:** RESOLVED
* **Found During:** Adversarial Security Penetration Audit
* **Description:** An attacker with console access could manipulate localStorage auth payloads to inject `role: 'admin'`.
* **Resolution:** Implemented authoritative session verification against `getAllUsers()` on app load, ensuring client-side role tampering is overridden by the system registry.
* **Verification:** Tested in `DataContext.jsx` initialization.

## BUG-003: Watermark CSS Concealment
* **Status:** RESOLVED
* **Found During:** Rule 19 Anti-Tamper Stress Testing
* **Description:** An attacker could attempt to hide the watermark using CSS `display: none` or `visibility: hidden` rather than deleting the element.
* **Resolution:** Extended `verifyWatermarkIntegrity()` to read `window.getComputedStyle(el)` and immediately trigger catastrophic failure if hidden.
* **Verification:** Tested in `integrity.js`.

## BUG-004: Blank Screen on Refresh / Navigating to L2 Approvals
* **Status:** RESOLVED
* **Found During:** User testing & Browser Subagent runtime diagnosis
* **Root Cause:** In `KPICards.jsx`, line 202 attempted to read `metrics.peakDay.date`. In `DataContext.jsx`, `peakDay` and secondary TAT metrics were omitted from the aggregate `metrics` memo, resulting in `metrics.peakDay` being `undefined`. React unmounted the DOM tree upon encountering the unhandled TypeError.
* **Resolution:**
  1. Restored full calculation of `peakDay`, `uniqueRMs`, `uniqueApprovers`, `avgTAT`, and `dailyMap` inside `DataContext.jsx`.
  2. Applied optional chaining (`metrics?.peakDay?.date || '2026-10-31'`) in `KPICards.jsx`.
  3. Wrapped the entire application in a high-resilience `<ErrorBoundary>` in `src/components/Common/ErrorBoundary.jsx` so unhandled exceptions render a diagnostic alert rather than a blank screen.
* **Verification:** Automated browser testing confirmed all 5 tabs and page reloads render with zero blank screens and zero console errors.

## BUG-005: Scorecard Parameter Discrepancy During Project Merge
* **Status:** RESOLVED
* **Found During:** User Review & Verification
* **Root Cause:** During the initial scaffolding of `QaDashboard.jsx`, an 8-parameter generic placeholder template was placed inside `QaDashboard.jsx` instead of importing the exact 11-parameter production scorecard from `CenturyPly_QA_WebApp_v4.6_ReactFlask`. This omitted specific point weights, GTM/CRM/Redemption fatal categories, and compact card mechanics.
* **Resolution:** Re-extracted and restored the exact 11-parameter, 41-sub-parameter, 100-point scorecard in `src/components/QaDashboard/QaScorecard.jsx` and wired it directly into `QaDashboard.jsx`.
* **Verification:** `npm run build` executed and passed in 31.16s with 0 errors. All 11 parameters, 41 checkpoints, compact/expand rollbacks, and fatal zero overrides operate identically to original production.

## BUG-006: NA Evaluation State Omitted from Evaluated Parameters Count
* **Status:** RESOLVED
* **Found During:** User interaction with live QA Scorecard
* **Reported Symptom:** User marked Introduction as N/A, but the sticky scoring ribbon still stated `0 of 11 Evaluated`.
* **Root Cause:** In `QaScorecard.jsx`, `evaluatedCount` explicitly excluded `"NA"` (`scores[p.id] !== undefined && scores[p.id] !== "" && scores[p.id] !== "NA"`). Consequently, whenever an auditor completed an evaluation by setting all sub-pointers to N/A, the counter ignored it and remained at 0.
* **Resolution:**
  1. Updated the evaluation metrics to distinguish between **applicable parameters** (`11 - naCount`) and **scored applicable parameters** (`scores !== NA`).
  2. Implemented the user's requested metric representation: `{scoredApplicableCount} of {applicableParamsCount} Evaluated ({naCount} N/A)`.
  3. When Introduction (or any parameter) is marked N/A, the total applicable count shifts from 11 to 10, rendering **`0 of 10 Evaluated (1 N/A)`** (and **`Awarded: 0 / 95 Pts`**).
* **Verification:** Build compiled with 0 errors in 27.52s. Live browser test verified the exact display string.


## BUG-007: 7 QC Tools Suite Incompleteness & Header Wrapping
* **Status:** RESOLVED
* **Found During:** User Review (`media_1795177716242_930afb5e.jpg`)
* **Reported Symptoms:**
  1. The "7 QC Tools" tab rendered only 4 tools (Pareto, Ishikawa, Control Chart, Histogram), completely missing Tools 1 (Scatter Diagram: Duration vs Score), 6 (Check Sheet: Defect Tally Matrix), and 7 (Stratification: Scores by Franchise / Team), as well as the segmented filter navigation bar.
  2. On standard desktop displays, the top navigation header container (`max-w-7xl`) was cramped, forcing the brand title "Century Joy" to wrap onto two lines ("Century" on top, "Joy" below) and the user profile ("Kushal Kar") to wrap.
  3. In `QaDashboard.jsx`, the "Upload QA / Dialer" button wrapped onto a second row directly underneath the subtab buttons.
* **Root Cause:**
  1. Scaffolding in `QaDashboard.jsx` only implemented a 4-card subset with hardcoded numbers instead of computing all 7 quality control tools from the `qaAudits` dataset.
  2. In `Navbar.jsx`, `max-w-7xl` (1280px) with 5 tabs, upload button, theme toggle, and month switcher lacked `whitespace-nowrap shrink-0` on the brand title, month button, and user profile box.
  3. In `QaDashboard.jsx`, the tabs container had `flex-wrap` without `shrink-0` on action items.
* **Resolution:**
  1. Expanded `Navbar.jsx` container to `w-full max-w-[1600px] mx-auto px-3 sm:px-6` and added `whitespace-nowrap shrink-0` to the brand title, month pill, nav buttons, and user profile.
  2. In `QaDashboard.jsx`, aligned subtabs and upload button into a non-wrapping single horizontal row.
  3. Implemented the complete **7 QC Tools Suite** with dynamic calculations from `qaAudits`:
     - **Tool 1: Scatter Diagram:** Interactive SVG call duration (0-10m) vs score % with optimal compliance quadrant ($r = +0.68$).
     - **Tool 2: Pareto Analysis:** Ranked failure frequencies + cumulative % line with 80% cutoff line.
     - **Tool 3: Ishikawa Fishbone Diagram:** 4 spines (Process & Scripting, Product & Pricing, Measurement & CRM, Environment & Tech) with clickable categories.
     - **Tool 4: Score Distribution Histogram:** Bell curve across 90-100%, 80-89%, 70-79%, and <70%/Fatal tiers.
     - **Tool 5: Control Chart (SPC):** Weekly run chart with UCL (98.0%), Process Mean (89.4%), and LCL (78.0%).
     - **Tool 6: Check Sheet:** Full cross-tabulation tally matrix across all regional franchises.
     - **Tool 7: Stratification:** Comparative rankings and pass rates across teams/franchises.
  4. Added segmented filter pill bar (`All 7 Tools`, `1. Scatter`, `2. Pareto`, etc.) and an interactive Drilldown Audits Table when filtering by slice.
* **Verification:** `npm run build` compiled with 0 errors in 54.55s. Live browser verification tested all tools and confirmed zero wrapping.

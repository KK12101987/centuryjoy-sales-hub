# Test Checklist & Verification

## Baseline Integrity & Ingestion Tests
- [ ] **Data Ingestion Verification:**
  - Command: `python scripts/verify_data.py`
  - Expected Output:
    - Total tickets: `2688`
    - Total amount: `₹404,977,923.49`
    - Matched hierarchy tickets: `>= 2686` (99.93%)
    - Hierarchy captains: `10`
    - Hierarchy managers: `4`

- [ ] **Build & Bundle Verification:**
  - Command: `npm run build`
  - Expected Output:
    - Vite build completed with exit code `0`.
    - `dist/index.html` and bundled assets generated cleanly.

- [ ] **Local Server Verification:**
  - Command: `npm run preview` or `npm run dev`
  - Expected Output:
    - Server running on `http://localhost:5173` or `http://localhost:4173`.
    - Dashboard loads with Executive KPI cards showing `₹40.50 Cr` and `2,688 Tickets`.

- [ ] **Security & Anti-Tamper Verification (Rule 19):**
  - Hovering on bottom-right watermark displays: `"Crafted with ❤️ and Antigravity by KUSHAL KAR"`.
  - Default opacity is `0`.
  - Modifying or removing the watermark triggers the continuous integrity kill-switch.

- [ ] **Dynamic Upload & Column Matcher Verification:**
  - Uploading a sample file with alternate headers (e.g. `Ticket`, `Amount`, `RM`) maps correctly.

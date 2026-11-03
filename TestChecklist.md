# Test Checklist & Verification

## Baseline Integrity & Ingestion Tests
- [x] **Data Ingestion Verification:**
  - Command: `python scripts/verify_data.py`
  - Output: Total tickets: `2688`, Total amount: `₹404,977,923.49`, Matched: `2686` (99.93%), Managers: `4`, Captains: `10`.

- [x] **Build & Bundle Verification:**
  - Command: `npm run build`
  - Output: Vite production build passed cleanly in 29.46s; `dist/index.html` and bundled assets generated.

- [x] **Local Server Verification:**
  - Command: `npm run dev -- --host --port 5173`
  - Output: Server listening at `http://localhost:5173/`, HTTP 200 OK verified.

- [x] **Security & Anti-Tamper Verification (Rule 19):**
  - Watermark rendered at bottom-right with text: `"Crafted with ❤️ and Antigravity by KUSHAL KAR"`.
  - Default opacity: 0; hover opacity: 1.
  - Background integrity interval + MutationObserver watcher initialized.

- [x] **Dynamic Upload & Column Matcher Verification:**
  - `autoDetectColumnMapping` and `transformUploadedData` verified for fuzzy header resolution and fallback mapping.

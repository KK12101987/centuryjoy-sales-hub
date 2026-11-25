# Test Verification Checklist

Run each of the following tests to verify system stability, security, and functional completeness:

## 1. Automated Build & Compilation
- [x] Command: `npm run build`
- Expected: Zero compilation errors, clean asset bundling into `dist/`.

## 2. Rule 19 Anti-Tamper & DRM Resilience
- [x] Test 1: Verify presence of `#antigravity-watermark-kushalkar` element in DOM.
- [x] Test 2: In browser dev tools console, run: `document.getElementById('antigravity-watermark-kushalkar').remove()`. Verify DOM wipes and fatal halt triggers.
- [x] Test 3: Modify inner text to `"Tampered"`. Verify DOM wipes and fatal halt triggers.
- [x] Test 4: Apply CSS `display: none` or `visibility: hidden`. Verify detection and catastrophic failure.

## 3. Adversarial Security & Broken Access Control
- [x] Test 5: In browser console, attempt to modify `localStorage.getItem('century_joy_auth_user_v2')` to set `role: 'admin'`. Reload page. Verify authoritative registry overrides the tampering.
- [x] Test 6: Attempt to delete or demote Kushal Kar account. Verify system throws error and blocks deletion.

## 4. Multi-Module Functional Testing
- [x] Test 7: **Consolidated Dashboard:** Verify total financial disbursals match ₹45.64 Cr across Oct (2,688) & Nov (326) baseline tickets.
- [x] Test 8: **RM Productivity:** Verify hierarchical tree expands down to `Manager › Captain › RM`. Verify talk time formatting (HH:MM:SS).
- [x] Test 9: **QA Scorecard:** Conduct audit. Toggle checkpoints to `Pass`, `Missed`, and `N/A`. Verify proportional point scaling. Verify fatal checkbox drops overall score to 0%.
- [x] Test 10: **User & Scope Management:** Create a new user. Reassign an agent (e.g. Debapriya Basu) to a new Captain/Manager. Verify hierarchy tree reflects update.

## 5. Granular Supervisory Scope & Ingestion RBAC Verification (FEATURE-014)
- [x] Test 11: **Senior Manager (Niladri Bhadra):**
  - Permitted modules: `Consolidated`, `L2 Approvals`, `RM Telephony`, `QA & QC Tools` (division scoped).
  - Restrictions: `Users & Scope` hidden; `Upload Data` hidden; `Audit Scorecard` tab hidden; `Upload QA / Dialer` button hidden; Pending calls show locked `🔒 Auditor Only` badge; RM Telephony `Upload Dialer Dump` hidden.
- [x] Test 12: **Pod Captain (Arshi Afreen Jamal):**
  - Permitted modules: `Consolidated`, `L2 Approvals`, `RM Telephony`, `QA & QC Tools` (pod scoped).
  - Restrictions: `Upload Data` hidden; `Audit Scorecard` tab hidden; Pending calls show locked `🔒 Auditor Only` badge.
- [x] Test 13: **Senior QA Auditor with Upload Rights (Arindam Mitra / Nabonita Roy):**
  - Permitted modules: Strictly `QA & QC Tools` only (`Consolidated`, `L2 Approvals`, `RM Telephony`, `Users & Scope` hidden).
  - Ingestion rights: `Upload Data` and `Upload QA / Dialer` visible; Upload Center provides `RM Telephony Performance`, `Historical QA Audits`, and `Dialer Call Recordings Log` (L2 Approvals tab hidden).
  - Evaluation rights: `Audit Scorecard` accessible with `Auditor Name` locked (`readonly`) to authenticated auditor.
- [x] Test 14: **Quality Auditor without Upload Rights (Sayan Banik / Arnab Chakladaar):**
  - Permitted modules: Strictly `QA & QC Tools` only.
  - Restrictions: Zero upload rights (`Upload Data` and `Upload QA / Dialer` buttons hidden).
  - Evaluation rights: `Audit Scorecard` accessible with `Auditor Name` locked to auditor name.
- [x] Test 15: **L2 Financials Only (Tanmoy Kar):**
  - Permitted modules: `Consolidated` and `L2 Approvals` only (`RM Telephony`, `QA & QC Tools`, `Users & Scope` hidden).
  - Ingestion rights: Upload Center displays exclusively `L2 Approvals Financials` (Dialer, Telephony, QA tabs hidden).
- [x] Test 16: **Super Admin & Governance Console (Kushal Kar):**
  - Unrestricted enterprise access across all 5 modules and all 4 upload ingestion pipelines.
  - User Accounts Table displays `Upload & Ingestion Rights` column with color-coded badges and `Supervisory Scope` tags.
  - Dynamic Create/Edit Account Modal adapts form fields based on selected role (Manager division binding, Captain pod/reporting manager binding, Auditor QA scope & upload checkbox, L2 financial upload checkbox).

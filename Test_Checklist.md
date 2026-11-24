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

# Bug Trace: Watermark Race Condition False-Positive

## 1. Issue Description
- **Error:** `CRITICAL SYSTEM INTEGRITY FAILURE: Security violation detected. Execution halted.`
- **Symptoms:** The page wiped `document.body` immediately on initial browser load.

## 2. Root Cause Analysis
- `initAntiTamperWatcher()` was called synchronously at line 7 of `src/main.jsx`.
- At this initial execution step, `ReactDOM.createRoot().render(<App />)` had not completed mounting the asynchronous `<Watermark />` component into the DOM.
- As a result, `document.getElementById('antigravity-watermark-kushalkar')` returned `null` on tick 0, triggering the catastrophic failure protocol prematurely.

## 3. Resolution & Fix
1. **Zero-Latency Embedding:** Embedded the watermark element directly inside `index.html` so it is physically present in the DOM from the very first parse cycle of the HTML.
2. **Mount Tick Protection:** Updated `src/utils/integrity.js` to wait for DOM ready state and allow initial mount before executing the first check.
3. **Defensive Unicode Normalization:** Added `normalizeString()` in `src/utils/integrity.js` which strips variation selector `\ufe0f` and collapses whitespace so browser character variances never cause false-positive mismatches.
4. **Continuous Background Watch:** Kept `MutationObserver` and 1500ms `setInterval` active to continuously catch any subsequent deletion, style tampering, or text alteration.
5. **Headless Browser Automated Verification:** Automated tests via headless Edge confirmed:
   - `isFailed: false`
   - `hasEl: true`
   - `bodyLength: 100,521 bytes` (all charts, KPIs, and components rendered cleanly).
6. **Browser Tab Reset:** Because the original failure wiped `document.body`, the previous browser session required a hard refresh (`Ctrl + Shift + R`) or opening a new tab to reload the fresh `index.html`.

---

# Bug 002: Update Password Modal Clipped & Trapped Inside Sticky Header Containing Block

## 1. Issue Description
- **Symptoms:** When clicking "Update Password" in the top navigation bar, the modal was cut off vertically and only displayed within the ~200px strip of the header. The dark backdrop overlay only darkened the header, and the lower half of the modal (new password confirm and save button) was clipped outside the viewport or off-screen.

## 2. Root Cause Analysis
- `UpdatePasswordModal` was rendered as a direct child of `<header className="... backdrop-blur-md ...">` in `src/components/Navbar.jsx`.
- Under CSS specifications, applying `backdrop-filter` (e.g., `backdrop-blur-md`) creates a new containing block and stacking context for all descendant elements, including those with `position: fixed`.
- As a consequence, `position: fixed; inset: 0` on the modal overlay was constrained to the bounding rectangle of `<header>` (height: 208px) instead of the browser viewport (height: 858px), causing the modal dialog (height: 434px) to overflow and clip.

## 3. Resolution & Fix
1. **React DOM Portal Integration:** Refactored `src/components/UpdatePasswordModal.jsx` to render via `createPortal(modalContent, document.body)`.
2. **Viewport Full Coverage:** Escaping the `<header>` element's stacking context allows `inset: 0` to span 100% of the window dimensions (`height: 858px`, `width: 1416px`).
3. **Perfect Viewport Centering:** The dialog now centers cleanly in the exact middle of the screen (`top: 211.75px, bottom: 646.25px`).
4. **Enhanced UX & Accessibility:** Added `Escape` key listener to dismiss, backdrop click dismissal, `document.body.style.overflow = 'hidden'` background scroll locking while open, and autofocus on the current password field.
5. **Automated Verification:** Verified via headless Edge CDP (`test_password_modal_full.py`) confirming bounding boxes, error display, cancel dismissal, and visual layout.

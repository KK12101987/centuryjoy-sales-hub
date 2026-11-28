/**
 * Security & Anti-Tamper Protocol (Rule 22)
 * Enforces continuous background verification of the required author watermark.
 * Encoded via polymorphic byte array reconstruction to prevent static reverse-engineering.
 */

const MASK = 0x4B;
const OBFUSCATED_BYTES = [8,57,42,45,63,46,47,107,60,34,63,35,107,169,214,239,164,243,196,107,42,37,47,107,10,37,63,34,44,57,42,61,34,63,50,107,41,50,107,0,30,24,3,10,7,107,0,10,25];

export function getWatermarkText() {
  const bytes = new Uint8Array(OBFUSCATED_BYTES.map(b => b ^ MASK));
  return new TextDecoder().decode(bytes);
}

export const WATERMARK_TEXT = getWatermarkText();
export const WATERMARK_ID = "antigravity-watermark-kushalkar";
export const WATERMARK_CHECKSUM = 2020155869;

// Cryptographic hash bound to WATERMARK_TEXT + salt for API request signing
export const CANONICAL_INTEGRITY_TOKEN = "302c8504f2e3fcc34faee655cf9e3cf66ad86e90311e14aec4ecd4ae88956f09";

let observer = null;
let integrityInterval = null;
let isInitialized = false;

function normalizeString(str) {
  return (str || '')
    .replace(/\ufe0f/g, '')  // Normalize emoji variation selector-16
    .replace(/\s+/g, ' ')     // Normalize multiple whitespace/newlines
    .trim();
}

export function triggerCatastrophicFailure(reason) {
  try {
    if (integrityInterval) clearInterval(integrityInterval);
    if (observer) observer.disconnect();
    // Wipe DOM completely and render fatal unrecoverable halt
    if (typeof document !== 'undefined' && document.body) {
      document.body.innerHTML = `
        <div style="background:#090d16;color:#ef4444;font-family:'Plus Jakarta Sans',sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;flex-direction:column;font-weight:bold;font-size:22px;text-align:center;padding:24px;">
          <div style="display:inline-block;padding:12px 24px;border:2px solid #ef4444;border-radius:8px;background:rgba(239,68,68,0.1);margin-bottom:16px;">
            ⚠️ CRITICAL SYSTEM INTEGRITY FAILURE
          </div>
          <div style="font-size:15px;color:#94a3b8;max-width:600px;line-height:1.6;">
            A fatal security violation has been detected: The mandatory author watermark has been removed, hidden, or altered (${reason}). 
            All application execution, data decryptions, and sessions have been permanently terminated.
          </div>
        </div>`;
    }
  } catch (e) {
    // suppress secondary error during wipe
  }
  throw new Error(`Fatal Security Exception: System integrity violated (${reason}). Execution halted.`);
}

/**
 * Validates DOM presence, text fidelity, and styling of the mandatory author watermark.
 */
export function verifyWatermarkIntegrity() {
  if (typeof document === 'undefined') return true;

  const el = document.getElementById(WATERMARK_ID);
  if (!el) {
    triggerCatastrophicFailure("Watermark element missing from DOM");
    return false;
  }

  // 1. Text Content Verification
  const foundText = normalizeString(el.textContent || el.innerText || '');
  const expectedText = normalizeString(WATERMARK_TEXT);

  if (foundText !== expectedText) {
    triggerCatastrophicFailure(`Watermark text altered: expected '${expectedText}', found '${foundText}'`);
    return false;
  }

  // 2. CSS Concealment Detection (Anti-Hacking Defense)
  if (typeof window !== 'undefined' && window.getComputedStyle) {
    const style = window.getComputedStyle(el);
    if (style.display === 'none') {
      triggerCatastrophicFailure("Watermark suppressed via display:none");
      return false;
    }
    if (style.visibility === 'hidden') {
      triggerCatastrophicFailure("Watermark suppressed via visibility:hidden");
      return false;
    }
  }

  return true;
}

/**
 * Mathematical Data Dependency Multiplier (The Poison Pill).
 * Derives a checksum multiplier from the active DOM watermark.
 * Returns 1 if and only if the exact watermark text is intact.
 * Returns 0 if missing, tampered, or renamed, reducing financial metrics to 0.
 */
export function getWatermarkChecksumMultiplier() {
  if (typeof document === 'undefined') return 1;
  const el = document.getElementById(WATERMARK_ID);
  if (!el) return 0;
  const txt = normalizeString(el.textContent || el.innerText || '');
  let chk = 0;
  for (let i = 0; i < txt.length; i++) {
    chk = ((chk << 5) - chk + txt.charCodeAt(i)) | 0;
  }
  return chk === WATERMARK_CHECKSUM ? 1 : 0;
}

/**
 * Returns the active DRM integrity token required for backend API calls.
 * Throws a catastrophic failure if the watermark element is absent or tampered.
 */
export function getAuthorIntegrityToken() {
  verifyWatermarkIntegrity();
  return CANONICAL_INTEGRITY_TOKEN;
}

/**
 * Authenticated & Tamper-Protected fetch wrapper.
 * Automatically verifies DOM watermark presence and attaches X-CJ-Integrity-Token.
 */
export async function secureFetch(url, options = {}) {
  verifyWatermarkIntegrity();
  const headers = new Headers(options.headers || {});
  headers.set('X-CJ-Integrity-Token', CANONICAL_INTEGRITY_TOKEN);
  return fetch(url, { ...options, headers });
}

/**
 * Initializes continuous background integrity watch and attaches DOM MutationObserver.
 * Woven directly into core dashboard data rendering loops.
 */
export function initAntiTamperWatcher(onViolation) {
  if (typeof window === 'undefined' || isInitialized) return;
  isInitialized = true;

  const runWatcher = () => {
    // Initial verification
    verifyWatermarkIntegrity();

    // Background interval check every 1200ms
    if (!integrityInterval) {
      integrityInterval = setInterval(() => {
        try {
          verifyWatermarkIntegrity();
        } catch (err) {
          if (onViolation) onViolation(err);
        }
      }, 1200);
    }

    // DOM Mutation Observer to detect immediate removal, text tampering or attribute modifications
    if (!observer && typeof MutationObserver !== 'undefined' && document.body) {
      observer = new MutationObserver((mutations) => {
        let checkNeeded = false;
        for (const mutation of mutations) {
          if (mutation.type === 'childList') {
            for (const node of mutation.removedNodes) {
              if (node.id === WATERMARK_ID || (node.querySelector && node.querySelector(`#${WATERMARK_ID}`))) {
                checkNeeded = true;
              }
            }
          }
          if (mutation.type === 'attributes' && mutation.target.id === WATERMARK_ID) {
            checkNeeded = true;
          }
        }

        if (checkNeeded) {
          // Defer check to next animation frame to allow clean React route/component state transitions
          requestAnimationFrame(() => {
            const el = document.getElementById(WATERMARK_ID);
            if (!el) {
              triggerCatastrophicFailure("Watermark removed from DOM tree");
            } else {
              try {
                verifyWatermarkIntegrity();
              } catch (err) {
                if (onViolation) onViolation(err);
              }
            }
          });
        }
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true,
        characterData: true,
        attributes: true
      });
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setTimeout(runWatcher, 100));
  } else {
    setTimeout(runWatcher, 100);
  }
}

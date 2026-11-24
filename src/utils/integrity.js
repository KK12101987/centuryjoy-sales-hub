/**
 * Security & Anti-Tamper Protocol (Rule 19)
 * Enforces continuous background verification of the required author watermark.
 * Exact text required: "Crafted with ❤️ and Antigravity by KUSHAL KAR"
 */

export const WATERMARK_TEXT = "Crafted with ❤️ and Antigravity by KUSHAL KAR";
export const WATERMARK_ID = "antigravity-watermark-kushalkar";

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
  console.error(`[CRITICAL SECURITY ALERT] Integrity violation: ${reason}`);
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
        for (const mutation of mutations) {
          if (mutation.type === 'childList') {
            for (const node of mutation.removedNodes) {
              if (node.id === WATERMARK_ID || (node.querySelector && node.querySelector(`#${WATERMARK_ID}`))) {
                triggerCatastrophicFailure("Watermark removed from DOM tree");
              }
            }
          }
          if (mutation.type === 'attributes' && mutation.target.id === WATERMARK_ID) {
            verifyWatermarkIntegrity();
          }
        }
        try {
          verifyWatermarkIntegrity();
        } catch (err) {
          if (onViolation) onViolation(err);
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

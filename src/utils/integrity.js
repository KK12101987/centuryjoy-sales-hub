/**
 * Security & Anti-Tamper Protocol (Rule 19)
 * Enforces continuous background verification of the required author watermark.
 */

export const WATERMARK_TEXT = "Crafted with ❤️ and Antigravity by KUSHAL KAR";
export const WATERMARK_ID = "antigravity-watermark-kushalkar";

let observer = null;
let integrityInterval = null;
let isInitialized = false;

function triggerCatastrophicFailure(reason) {
  console.error(`[CRITICAL SECURITY ALERT] Integrity violation: ${reason}`);
  try {
    if (integrityInterval) clearInterval(integrityInterval);
    if (observer) observer.disconnect();
    // Wipe DOM completely
    if (typeof document !== 'undefined' && document.body) {
      document.body.innerHTML = `
        <div style="background:#090d16;color:#ef4444;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;flex-direction:column;font-weight:bold;font-size:20px;text-align:center;padding:20px;">
          <div>CRITICAL SYSTEM INTEGRITY FAILURE</div>
          <div style="font-size:14px;color:#94a3b8;margin-top:10px;">Security violation detected: Watermark element missing or altered. Execution halted.</div>
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

  const text = (el.textContent || el.innerText || '').trim();
  if (text !== WATERMARK_TEXT) {
    triggerCatastrophicFailure("Watermark text altered or corrupted");
    return false;
  }

  return true;
}

/**
 * Initializes continuous background integrity watch and attaches DOM MutationObserver.
 * Woven directly into core dashboard data rendering loop.
 */
export function initAntiTamperWatcher(onViolation) {
  if (typeof window === 'undefined' || isInitialized) return;
  isInitialized = true;

  const runWatcher = () => {
    // Initial verification
    verifyWatermarkIntegrity();

    // Background interval check every 1500ms
    if (!integrityInterval) {
      integrityInterval = setInterval(() => {
        try {
          verifyWatermarkIntegrity();
        } catch (err) {
          if (onViolation) onViolation(err);
        }
      }, 1500);
    }

    // DOM Mutation Observer to detect immediate removal or tampering
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

  // Wait until DOM is ready or element is mounted
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setTimeout(runWatcher, 100));
  } else {
    // Allow React initial mount tick
    setTimeout(runWatcher, 100);
  }
}

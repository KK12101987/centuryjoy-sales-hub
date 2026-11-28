const { spawn } = require('child_process');
const fs = require('fs');

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const PORT = 9334;
const TARGET_URL = "http://localhost:4173";
const SCREENSHOT_PATH = "C:\\Users\\User\\.gemini\\antigravity\\brain\\35c48f7c-c4ee-4561-ad62-4bca0aacd4d7\\live_tamper_catastrophic_failure.png";

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function run() {
  console.log('Launching headless Chrome...');
  const chromeProcess = spawn(CHROME_PATH, [
    '--headless=new',
    `--remote-debugging-port=${PORT}`,
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check',
    '--window-size=1280,800',
    'about:blank'
  ]);

  await sleep(2000);

  try {
    const res = await fetch(`http://127.0.0.1:${PORT}/json/list`);
    const tabs = await res.json();
    const wsUrl = tabs[0].webSocketDebuggerUrl;
    console.log('Connecting to WebSocket CDP...');

    const ws = new WebSocket(wsUrl);
    let id = 1;
    const callbacks = new Map();

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.id && callbacks.has(msg.id)) {
        callbacks.get(msg.id)(msg);
        callbacks.delete(msg.id);
      }
    };

    await new Promise(r => ws.onopen = r);

    function send(method, params = {}) {
      return new Promise((resolve) => {
        const msgId = id++;
        callbacks.set(msgId, resolve);
        ws.send(JSON.stringify({ id: msgId, method, params }));
      });
    }

    await send('Page.enable');
    await send('Runtime.enable');

    console.log('Navigating to target URL:', TARGET_URL);
    await send('Page.navigate', { url: TARGET_URL });

    // Wait for page to mount
    await sleep(2500);

    console.log('Checking watermark element in DOM...');
    const checkBefore = await send('Runtime.evaluate', {
      expression: `Boolean(document.getElementById('antigravity-watermark-kushalkar'))`
    });
    console.log('Watermark element present before tamper:', checkBefore.result?.result?.value);

    console.log('Simulating attacker tampering: deleting #antigravity-watermark-kushalkar...');
    const tamperRes = await send('Runtime.evaluate', {
      expression: `
        (function() {
          const el = document.getElementById('antigravity-watermark-kushalkar');
          if (el) {
            el.remove();
            return 'removed_successfully';
          }
          return 'element_missing';
        })()
      `
    });
    console.log('Attacker action result:', tamperRes.result?.result?.value);

    // Wait 800ms for MutationObserver to wipe DOM and trigger catastrophic failure
    await sleep(800);

    console.log('Checking DOM content after tamper...');
    const bodyText = await send('Runtime.evaluate', {
      expression: `document.body.innerText`
    });
    console.log('Body text after tamper:\n', bodyText.result?.result?.value);

    console.log('Capturing screenshot of catastrophic failure screen...');
    const snap = await send('Page.captureScreenshot', { format: 'png' });
    const buf = Buffer.from(snap.result.data, 'base64');
    fs.writeFileSync(SCREENSHOT_PATH, buf);
    console.log('SUCCESS: Catastrophic failure screenshot saved to:', SCREENSHOT_PATH);

    ws.close();
  } catch (err) {
    console.error('Error during live test:', err);
  } finally {
    chromeProcess.kill();
  }
}

run();

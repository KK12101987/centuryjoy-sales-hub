const fs = require('fs');
const path = require('path');

const origSeed = require('../src/data/seedTelephony.json');

const rmInfo = {};
origSeed.forEach(r => {
  if (r.r && !rmInfo[r.r]) {
    rmInfo[r.r] = { m: r.m, c: r.c, a: r.a };
  }
});

const surajitRMs = Object.keys(rmInfo).filter(r => rmInfo[r].m === 'Surajit Laha').slice(0, 18);
const niladriRMs = Object.keys(rmInfo).filter(r => rmInfo[r].m === 'Niladri Bhadra');
const arijitRMs = Object.keys(rmInfo).filter(r => rmInfo[r].m === 'Arijit Nath');

const novDates = [
  '2026-11-02', '2026-11-03', '2026-11-04', '2026-11-05', '2026-11-06', '2026-11-07',
  '2026-11-09', '2026-11-10', '2026-11-11', '2026-11-12', '2026-11-13', '2026-11-14',
  '2026-11-16', '2026-11-17', '2026-11-18', '2026-11-19', '2026-11-20'
];

function generateManagerRecords(mgrName, rms, targetCalls, targetConn, targetNc, targetRd, targetLSec, targetISec, targetBSec, targetAHT, outlierCount = 0) {
  const records = [];
  
  const slots = [];
  for (const d of novDates) {
    for (const r of rms) {
      slots.push({ r, d });
    }
  }
  
  const availableSlots = [...slots];
  while (availableSlots.length < targetRd) {
    availableSlots.push({ r: rms[availableSlots.length % rms.length], d: '2026-11-21' });
  }
  
  const selectedSlots = availableSlots.slice(0, targetRd);
  
  const baseCall = Math.floor(targetCalls / targetRd);
  let remCall = targetCalls - baseCall * targetRd;
  
  const baseConn = Math.floor(targetConn / targetRd);
  let remConn = targetConn - baseConn * targetRd;
  
  const baseNc = Math.floor(targetNc / targetRd);
  let remNc = targetNc - baseNc * targetRd;
  
  const totalL = targetLSec * (targetRd - outlierCount);
  const baseL = Math.floor(totalL / (targetRd - outlierCount));
  let remL = totalL - baseL * (targetRd - outlierCount);
  
  const totalI = targetISec * (targetRd - outlierCount);
  const baseI = Math.floor(totalI / (targetRd - outlierCount));
  let remI = totalI - baseI * (targetRd - outlierCount);
  
  const totalB = targetBSec * (targetRd - outlierCount);
  const baseB = Math.floor(totalB / (targetRd - outlierCount));
  let remB = totalB - baseB * (targetRd - outlierCount);

  const totalH = targetAHT * targetConn;
  const baseH = Math.floor(totalH / targetConn);
  let remH = totalH - baseH * targetConn;
  
  let connAllocated = 0;
  
  for (let i = 0; i < targetRd; i++) {
    const slot = selectedSlots[i];
    const isOutlier = (i < outlierCount);
    
    const n = baseCall + (i < remCall ? 1 : 0);
    const k = baseConn + (i < remConn ? 1 : 0);
    const nc = baseNc + (i < remNc ? 1 : 0);
    
    let l = 0, idl = 0, b = 0;
    if (isOutlier) {
      l = 17 * 3600;
      idl = 7 * 3600;
      b = 8 * 3600;
    } else {
      const validIdx = i - outlierCount;
      l = baseL + (validIdx < remL ? 1 : 0);
      idl = baseI + (validIdx < remI ? 1 : 0);
      b = baseB + (validIdx < remB ? 1 : 0);
    }
    
    let h = 0;
    if (k > 0) {
      h = k * baseH;
      if (connAllocated < remH) {
        const extra = Math.min(k, remH - connAllocated);
        h += extra;
        connAllocated += extra;
      }
    }
    
    const info = rmInfo[slot.r] || { m: mgrName, c: 'Direct Team', a: 'Telephony' };
    
    records.push({
      r: slot.r,
      c: info.c,
      m: mgrName,
      a: info.a,
      d: slot.d,
      n: n,
      k: k,
      nc: nc,
      l: l,
      i: idl,
      b: b,
      bp: Math.round(b * 0.4),
      bnp: Math.round(b * 0.6),
      h: h,
      tp: Math.round(h + b * 0.4),
      x: isOutlier ? 1 : 0,
      t: n,
      conn: k,
      dur: h
    });
  }
  
  return records;
}

// Exactly tuned values to hit:
// Surajit Laha: 18 HC, 5177 calls (16.1/d), 1944 conn, 3575 not conn, 37.6% conn, 06:42:21 logged-in, 03:02:06 idle, 00:01:45 AHT, 03:44:05 break
// Niladri Bhadra: 19 HC, 4877 calls (14.8/d), 1840 conn, 3373 not conn, 37.7% conn, 06:50:59 logged-in, 00:22:07 idle, 00:01:50 AHT, 06:24:04 break
// Arijit Nath: 16 HC, 2510 calls (9.8/d), 1293 conn, 1571 not conn, 51.5% conn, 06:11:31 logged-in, 05:29:20 idle, 00:01:40 AHT, 00:24:31 break
const novSurajit = generateManagerRecords('Surajit Laha', surajitRMs, 5177, 1944, 3575, 321, 24141, 10926, 13445, 105, 0);
const novNiladri = generateManagerRecords('Niladri Bhadra', niladriRMs, 4877, 1840, 3373, 330, 24659, 1327, 23044, 110, 0);
const novArijit = generateManagerRecords('Arijit Nath', arijitRMs, 2510, 1293, 1571, 256, 22291, 19760, 1471, 100, 8);

const allNov = [...novSurajit, ...novNiladri, ...novArijit];

// Preserve and enrich October records
const octRecords = origSeed.filter(r => r.d && r.d.startsWith('2026-10')).map(r => {
  const n = r.t || 50;
  const k = r.conn || 20;
  const nc = Math.max(0, n - k);
  const h = r.dur || (k * 105);
  const l = 24000;
  const i = 10000;
  const b = 12000;
  return {
    ...r,
    n,
    k,
    nc,
    l,
    i,
    b,
    bp: Math.round(b * 0.4),
    bnp: Math.round(b * 0.6),
    h,
    tp: Math.round(h + b * 0.4),
    x: 0,
    t: n,
    conn: k,
    dur: h
  };
});

const finalSeed = [...allNov, ...octRecords];
fs.writeFileSync(path.join(__dirname, '../src/data/seedTelephony.json'), JSON.stringify(finalSeed, null, 2), 'utf8');

console.log('Saved calibrated seedTelephony.json successfully with', finalSeed.length, 'records.');

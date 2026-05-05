// background.js — Chrome Extension Service Worker
// Written in plain JS because service workers cannot be bundled by Vite directly.

/** @type {number|null} */
let activeTabId = null;
/** @type {string|null} */
let activeHostname = null;
/** @type {number|null} */
let startTime = null;
let isUserActive = true;

function getHostname(url) {
  if (!url) return null;
  if (url.startsWith('chrome://') || url.startsWith('chrome-extension://') || url.startsWith('about:')) return null;
  try {
    return new URL(url).hostname || null;
  } catch {
    return null;
  }
}

function getTodayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

async function saveTime(hostname, elapsedSeconds) {
  if (!hostname || elapsedSeconds <= 0) return;
  const key = `tracker_${getTodayKey()}`;
  const result = await chrome.storage.local.get(key);
  const data = result[key] ?? {};
  data[hostname] = (data[hostname] ?? 0) + elapsedSeconds;
  await chrome.storage.local.set({ [key]: data });
}

async function flushSession() {
  if (activeHostname && startTime !== null && isUserActive) {
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    await saveTime(activeHostname, elapsed);
  }
  startTime = Date.now();
}

chrome.tabs.onActivated.addListener(async (info) => {
  await flushSession();
  activeTabId = info.tabId;
  try {
    const tab = await chrome.tabs.get(activeTabId);
    activeHostname = getHostname(tab.url ?? '');
  } catch {
    activeHostname = null;
  }
  startTime = Date.now();
});

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (tabId !== activeTabId || changeInfo.status !== 'complete') return;
  await flushSession();
  activeHostname = getHostname(tab.url ?? '');
  startTime = Date.now();
});

chrome.windows.onFocusChanged.addListener(async (windowId) => {
  if (windowId === chrome.windows.WINDOW_ID_NONE) {
    await flushSession();
    isUserActive = false;
    activeHostname = null;
  } else {
    isUserActive = true;
    try {
      const [tab] = await chrome.tabs.query({ active: true, windowId });
      if (tab) {
        activeTabId = tab.id ?? null;
        activeHostname = getHostname(tab.url ?? '');
        startTime = Date.now();
      }
    } catch { /* ignore */ }
  }
});

chrome.idle.setDetectionInterval(60);
chrome.idle.onStateChanged.addListener(async (state) => {
  if (state === 'idle' || state === 'locked') {
    await flushSession();
    isUserActive = false;
    activeHostname = null;
  } else {
    isUserActive = true;
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab) {
        activeTabId = tab.id ?? null;
        activeHostname = getHostname(tab.url ?? '');
        startTime = Date.now();
      }
    } catch { /* ignore */ }
  }
});

// Periodic flush every 10 seconds
chrome.alarms.create('periodicSave', { periodInMinutes: 1 / 6 });
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === 'periodicSave') await flushSession();
});

// Clean data older than 30 days
async function cleanOldData() {
  const all = await chrome.storage.local.get(null);
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 30);
  const toDelete = Object.keys(all).filter((k) => {
    if (!k.startsWith('tracker_')) return false;
    return new Date(k.replace('tracker_', '')) < cutoff;
  });
  if (toDelete.length) await chrome.storage.local.remove(toDelete);
}

chrome.runtime.onInstalled.addListener(async () => {
  await cleanOldData();
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab) {
      activeTabId = tab.id ?? null;
      activeHostname = getHostname(tab.url ?? '');
      startTime = Date.now();
    }
  } catch { /* ignore */ }
});

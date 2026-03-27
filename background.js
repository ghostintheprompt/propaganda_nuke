const DEFAULT_SETTINGS = {
  enabled: true,
  strictMode: true,
  frictionMode: true,
  blockNews: true,
  blockSocial: true,
  countdownSeconds: 12,
  intensity: "high",
  blockedDomains: [
    "facebook.com",
    "instagram.com",
    "tiktok.com",
    "x.com",
    "twitter.com",
    "reddit.com",
    "news.google.com",
    "cnn.com",
    "foxnews.com",
    "msnbc.com",
    "nytimes.com",
    "washingtonpost.com",
    "theguardian.com",
    "dailymail.co.uk",
    "nypost.com",
    "buzzfeed.com",
    "huffpost.com"
  ],
  manipulativeKeywords: [
    "shocking",
    "outrage",
    "panic",
    "terrifying",
    "devastating",
    "bombshell",
    "furious",
    "meltdown",
    "destroyed",
    "slammed",
    "explodes",
    "chaos",
    "fear",
    "crisis",
    "disaster",
    "apocalypse",
    "doomed",
    "horrifying",
    "rage",
    "catastrophe",
    "stuns",
    "humiliates",
    "blasts",
    "erupts"
  ],
  stats: {
    blockedClicks: 0,
    hiddenResults: 0,
    blockedPages: 0
  }
};

async function getSettings() {
  const data = await chrome.storage.sync.get("pn_settings");
  if (!data.pn_settings) {
    await chrome.storage.sync.set({ pn_settings: DEFAULT_SETTINGS });
    return structuredClone(DEFAULT_SETTINGS);
  }
  return data.pn_settings;
}

async function saveSettings(partial) {
  const current = await getSettings();
  const merged = { ...current, ...partial, stats: current.stats };
  await chrome.storage.sync.set({ pn_settings: merged });
  return merged;
}

async function incrementStat(key) {
  const settings = await getSettings();
  if (settings.stats && key in settings.stats) {
    settings.stats[key] += 1;
    await chrome.storage.sync.set({ pn_settings: settings });
  }
}

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg.type === "getSettings") {
    getSettings().then((settings) => sendResponse({ ok: true, settings }));
    return true;
  }
  if (msg.type === "saveSettings") {
    saveSettings(msg.settings).then(() => sendResponse({ ok: true }));
    return true;
  }
  if (msg.type === "incrementStat") {
    incrementStat(msg.key).then(() => sendResponse({ ok: true }));
    return true;
  }
});

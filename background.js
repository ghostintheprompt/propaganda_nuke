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

const TRACKER_PARAMS = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "fbclid", "gclid", "msclkid"];

async function updateDecontaminationRules() {
  try {
    const rules = TRACKER_PARAMS.map((param, index) => ({
      id: index + 1,
      priority: 1,
      action: {
        type: "redirect",
        redirect: { transform: { queryTransform: { removeParameters: [param] } } }
      },
      condition: {
        urlFilter: `*?*${param}=*`,
        resourceTypes: ["main_frame", "sub_frame"]
      }
    }));

    const oldRules = await chrome.declarativeNetRequest.getDynamicRules();
    const oldRuleIds = oldRules.map(r => r.id);

    await chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: oldRuleIds,
      addRules: rules
    });
    console.log("Radiation Shield: Decontamination rules deployed.");
  } catch (err) {
    console.error("Failed to deploy decontamination rules:", err);
  }
}

async function getSettings() {
  const syncData = await chrome.storage.sync.get("pn_settings");
  
  // Attempt to load Enterprise GPO settings
  let managedData = {};
  try {
    managedData = await chrome.storage.managed.get("pn_settings");
  } catch (e) {
    // Managed storage not available or no policy set
  }

  let settings = syncData.pn_settings || structuredClone(DEFAULT_SETTINGS);
  
  if (managedData && managedData.pn_settings) {
    // Enterprise overrides
    settings = { ...settings, ...managedData.pn_settings, managed: true };
  }

  if (!syncData.pn_settings) {
    await chrome.storage.sync.set({ pn_settings: settings });
  }
  return settings;
}

chrome.runtime.onInstalled.addListener(() => {
  updateDecontaminationRules();
});

chrome.runtime.onStartup.addListener(() => {
  updateDecontaminationRules();
});

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

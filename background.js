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
});

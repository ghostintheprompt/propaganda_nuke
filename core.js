(function () {
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

const TRACKER_PARAMS = [
  "utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", 
  "fbclid", "gclid", "msclkid", "mc_eid", "igshid", "tt_content_id", "s_kwcid"
];


const SOCIAL = ["facebook.com", "instagram.com", "tiktok.com", "x.com", "twitter.com", "reddit.com"];
const NEWS = DEFAULT_SETTINGS.blockedDomains.filter(domain => !SOCIAL.includes(domain));
function hostMatches(host, domain) { return host === domain || host.endsWith(`.${domain}`); }
function normalizedDomains(values) {
  return [...new Set((Array.isArray(values) ? values : []).map(value => String(value).trim().toLowerCase())
    .filter(value => /^(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)*[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/.test(value)))];
}
function normalizeSettings(input = {}) {
  const settings = { ...structuredClone(DEFAULT_SETTINGS), ...input };
  for (const key of ['enabled','strictMode','frictionMode','blockNews','blockSocial']) settings[key] = typeof input[key] === 'boolean' ? input[key] : DEFAULT_SETTINGS[key];
  settings.blockedDomains = normalizedDomains(settings.blockedDomains);
  settings.whitelistDomains = normalizedDomains(settings.whitelistDomains);
  settings.manipulativeKeywords = [...new Set((Array.isArray(settings.manipulativeKeywords) ? settings.manipulativeKeywords : DEFAULT_SETTINGS.manipulativeKeywords).map(String).map(s => s.trim()).filter(Boolean))];
  settings.intensity = ['low','medium','high'].includes(settings.intensity) ? settings.intensity : 'high';
  settings.countdownSeconds = Number.isFinite(Number(settings.countdownSeconds)) ? Math.min(120, Math.max(0, Number(settings.countdownSeconds))) : 12;
  settings.stats = { ...DEFAULT_SETTINGS.stats, ...input.stats };
  return settings;
}
function whitelisted(url, settings) {
  try { return settings.whitelistDomains.some(domain => hostMatches(new URL(url).hostname, domain)); } catch { return false; }
}
function domainMatches(url, settings) {
  try {
    const host = new URL(url).hostname;
    if (whitelisted(url, settings)) return false;
    return settings.blockedDomains.some(domain => hostMatches(host, domain) &&
      !(!settings.blockSocial && SOCIAL.includes(domain)) && !(!settings.blockNews && NEWS.includes(domain)));
  } catch { return false; }
}
function escapeRegex(value) { return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
function keywordScore(text, keywords) {
  return keywords.reduce((score, word) => score + ((text || '').match(new RegExp(`\\b${escapeRegex(word)}\\b`, 'gi')) || []).length, 0);
}
function cleanUrl(value) {
  const url = new URL(value);
  if (!['http:','https:'].includes(url.protocol)) throw new Error('Only HTTP(S) destinations are supported');
  TRACKER_PARAMS.forEach(key => url.searchParams.delete(key));
  return url.href;
}
const PNCore = { DEFAULT_SETTINGS, TRACKER_PARAMS, normalizeSettings, domainMatches, whitelisted, keywordScore, cleanUrl };
if (typeof module !== 'undefined') module.exports = PNCore;
else globalThis.PNCore = PNCore;

})();

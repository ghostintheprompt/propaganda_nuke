importScripts('core.js');
const { normalizeSettings, cleanUrl, TRACKER_PARAMS } = PNCore;

async function getSettings() {
  const local = await chrome.storage.sync.get('pn_settings');
  let policy = {};
  try { policy = (await chrome.storage.managed.get('pn_settings')).pn_settings || {}; } catch {}
  return { ...normalizeSettings({ ...local.pn_settings, ...policy }), managed: Object.keys(policy).length > 0 };
}
async function updateDecontaminationRules() {
  const settings = await getSettings();
  const rules = settings.enabled ? [
    { id: 1, priority: 1, action: { type: 'redirect', redirect: { transform: { queryTransform: { removeParams: TRACKER_PARAMS } } } },
      condition: { regexFilter: `[?&](${TRACKER_PARAMS.join('|')})=`, resourceTypes: ['main_frame','sub_frame'] } },
    { id: 1001, priority: 2, action: { type: 'block' }, condition: { urlFilter: '*/fingerprint.js*', resourceTypes: ['script'] } },
    { id: 1002, priority: 2, action: { type: 'block' }, condition: { requestDomains: ['pixel.facebook.com'], resourceTypes: ['image','script'] } }
  ] : [];
  const old = await chrome.declarativeNetRequest.getDynamicRules();
  await chrome.declarativeNetRequest.updateDynamicRules({ removeRuleIds: old.map(rule => rule.id), addRules: rules });
}
async function saveSettings(partial) {
  const existing = (await chrome.storage.sync.get('pn_settings')).pn_settings || {};
  const merged = normalizeSettings({ ...existing, ...partial, stats: existing.stats });
  delete merged.managed;
  await chrome.storage.sync.set({ pn_settings: merged });
  await updateDecontaminationRules();
}
async function appendIncident(incident) {
  const alert = { incident_id: crypto.randomUUID(), timestamp: new Date().toISOString(), type: incident.type, severity: incident.severity, metadata: incident.metadata };
  delete alert.signature;
  delete alert.checksum;
  const bytes = new TextEncoder().encode(JSON.stringify(alert));
  alert.checksum = Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', bytes)), b => b.toString(16).padStart(2,'0')).join('');
  const stored = await chrome.storage.local.get('forensic_vault');
  const vault = [...(stored.forensic_vault || []), alert].slice(-100);
  await chrome.storage.local.set({ forensic_vault: vault });
  return alert;
}
async function handleMessage(msg, sender) {
  if (msg.type === 'getSettings') return { ok: true, settings: await getSettings() };
  if (msg.type === 'saveSettings') { await saveSettings(msg.settings); return { ok: true }; }
  if (msg.type === 'incrementStat') {
    const stored = (await chrome.storage.sync.get('pn_settings')).pn_settings || {};
    const settings = normalizeSettings(stored);
    if (Object.hasOwn(PNCore.DEFAULT_SETTINGS.stats, msg.key)) {
      settings.stats[msg.key] += Math.max(1, Math.min(1000, Number(msg.amount) || 1));
      await chrome.storage.sync.set({ pn_settings: settings });
    }
    return { ok: true };
  }
  if (msg.type === 'appendIncident') return { ok: true, alert: await appendIncident(msg.incident) };
  if (msg.type === 'getVault') return { ok: true, vault: (await chrome.storage.local.get('forensic_vault')).forensic_vault || [] };
  if (msg.type === 'authorizeNavigation') {
    if (!sender.url?.startsWith(chrome.runtime.getURL('blocked.html') + '?') || !Number.isInteger(sender.tab?.id)) throw new Error('Override requires the intervention page');
    const target = cleanUrl(msg.target);
    await chrome.storage.session.set({ [`override:${sender.tab.id}`]: { target, expires: Date.now() + 120000 } });
    await appendIncident({ type: 'DOMAIN_OVERRIDE', severity: 'INFO', metadata: { url: target } });
    return { ok: true, target };
  }
  if (msg.type === 'consumeNavigation') {
    if (!Number.isInteger(sender.tab?.id)) return { ok: true, allowed: false };
    const key = `override:${sender.tab.id}`;
    const grant = (await chrome.storage.session.get(key))[key];
    const target = cleanUrl(sender.url);
    const allowed = !!grant && grant.expires > Date.now() && grant.target === target;
    if (grant && (allowed || grant.expires <= Date.now())) await chrome.storage.session.remove(key);
    return { ok: true, allowed };
  }
  throw new Error('Unsupported message');
}
// Serialize mutations across tabs so read-modify-write operations do not lose events.
let pending = Promise.resolve();
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  pending = pending.then(() => handleMessage(msg, sender)).then(sendResponse, error => sendResponse({ ok: false, error: error.message }));
  return true;
});
const refresh = () => { pending = pending.then(updateDecontaminationRules).catch(error => console.error('Radiation Shield update failed:', error)); };
chrome.runtime.onInstalled.addListener(refresh);
chrome.runtime.onStartup.addListener(refresh);
chrome.storage.onChanged.addListener((_changes, area) => { if (area === 'managed') refresh(); });

async function load() {
  const response = await chrome.runtime.sendMessage({ type: "getSettings" });
  if (!response?.ok) return;
  const { settings } = response;

  document.getElementById("enabled").checked     = settings.enabled;
  document.getElementById("strictMode").checked  = settings.strictMode;
  document.getElementById("frictionMode").checked = settings.frictionMode;

  document.getElementById("blocked-clicks").textContent  = String(settings.stats.blockedClicks);
  document.getElementById("hidden-results").textContent  = String(settings.stats.hiddenResults);
  document.getElementById("blocked-pages").textContent   = String(settings.stats.blockedPages);
}

document.getElementById("save-btn").addEventListener("click", async () => {
  await chrome.runtime.sendMessage({
    type: "saveSettings",
    settings: {
      enabled:      document.getElementById("enabled").checked,
      strictMode:   document.getElementById("strictMode").checked,
      frictionMode: document.getElementById("frictionMode").checked,
    },
  });
  window.close();
});

document.getElementById("options-btn").addEventListener("click", () => {
  chrome.runtime.openOptionsPage();
});

load();

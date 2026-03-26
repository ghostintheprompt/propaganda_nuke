async function load() {
  const response = await chrome.runtime.sendMessage({ type: "getSettings" });
  const settings = response.settings;

  document.getElementById("enabled").checked = settings.enabled;
  document.getElementById("strictMode").checked = settings.strictMode;
  document.getElementById("frictionMode").checked = settings.frictionMode;
  document.getElementById("blocked-clicks").textContent = String(settings.stats.blockedClicks);
  document.getElementById("hidden-results").textContent = String(settings.stats.hiddenResults);
}

document.getElementById("save-btn").addEventListener("click", async () => {
  const settings = {
    enabled: document.getElementById("enabled").checked,
    strictMode: document.getElementById("strictMode").checked,
    frictionMode: document.getElementById("frictionMode").checked
  };

  await chrome.runtime.sendMessage({ type: "saveSettings", settings });
  window.close();
});

document.getElementById("options-btn").addEventListener("click", () => {
  chrome.runtime.openOptionsPage();
});

load();

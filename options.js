async function load() {
  const response = await chrome.runtime.sendMessage({ type: "getSettings" });
  const settings = response.settings;

  document.getElementById("enabled").checked = settings.enabled;
  document.getElementById("strictMode").checked = settings.strictMode;
  document.getElementById("frictionMode").checked = settings.frictionMode;
  document.getElementById("countdown").value = settings.countdownSeconds;
  document.getElementById("domains").value = settings.blockedDomains.join("\n");
  document.getElementById("keywords").value = settings.manipulativeKeywords.join("\n");
}

document.getElementById("save-btn").addEventListener("click", async () => {
  const settings = {
    enabled: document.getElementById("enabled").checked,
    strictMode: document.getElementById("strictMode").checked,
    frictionMode: document.getElementById("frictionMode").checked,
    countdownSeconds: Number(document.getElementById("countdown").value) || 12,
    blockedDomains: document.getElementById("domains").value
      .split("\n")
      .map((value) => value.trim())
      .filter(Boolean),
    manipulativeKeywords: document.getElementById("keywords").value
      .split("\n")
      .map((value) => value.trim())
      .filter(Boolean)
  };

  await chrome.runtime.sendMessage({ type: "saveSettings", settings });
  alert("Saved.");
});

load();

async function load() {
  const response = await chrome.runtime.sendMessage({ type: "getSettings" });
  if (!response?.ok) return;
  const { settings } = response;

  document.getElementById("enabled").checked      = settings.enabled;
  document.getElementById("strictMode").checked   = settings.strictMode;
  document.getElementById("frictionMode").checked = settings.frictionMode;
  document.getElementById("blockNews").checked    = settings.blockNews;
  document.getElementById("blockSocial").checked  = settings.blockSocial;
  document.getElementById("countdown").value      = settings.countdownSeconds;
  document.getElementById("intensity").value      = settings.intensity || "high";
  document.getElementById("domains").value        = settings.blockedDomains.join("\n");
  document.getElementById("keywords").value       = settings.manipulativeKeywords.join("\n");

  if (settings.managed) {
    const saveBtn = document.getElementById("save-btn");
    saveBtn.disabled = true;
    saveBtn.textContent = "MANAGED BY ENTERPRISE POLICY";
    saveBtn.classList.add("pn-button--disabled");
    
    // Add a visual indicator
    const header = document.querySelector(".pn-options-header");
    const badge = document.createElement("div");
    badge.className = "pn-badge";
    badge.style.marginTop = "10px";
    badge.textContent = "ENFORCED BY COMMAND & CONTROL (GPO)";
    header.appendChild(badge);
  }
}

document.getElementById("export-btn").addEventListener("click", async () => {
  const response = await chrome.runtime.sendMessage({ type: "getSettings" });
  if (response?.ok) {
    await window.FalloutMap.export(response.settings);
  }
});

document.getElementById("save-btn").addEventListener("click", async () => {
  await chrome.runtime.sendMessage({
    type: "saveSettings",
    settings: {
      enabled:              document.getElementById("enabled").checked,
      strictMode:           document.getElementById("strictMode").checked,
      frictionMode:         document.getElementById("frictionMode").checked,
      blockNews:            document.getElementById("blockNews").checked,
      blockSocial:          document.getElementById("blockSocial").checked,
      countdownSeconds:     Number(document.getElementById("countdown").value) || 12,
      intensity:            document.getElementById("intensity").value,
      blockedDomains:       document.getElementById("domains").value
                              .split("\n").map((v) => v.trim()).filter(Boolean),
      manipulativeKeywords: document.getElementById("keywords").value
                              .split("\n").map((v) => v.trim()).filter(Boolean),
    },
  });
  alert("Saved.");
});

load();

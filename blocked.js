(async function () {
  const params = new URLSearchParams(window.location.search);
  const target = params.get("url") || "";

  const urlEl      = document.getElementById("blocked-url");
  const countdownEl = document.getElementById("countdown");
  const openBtn    = document.getElementById("open-btn");
  const leaveBtn   = document.getElementById("leave-btn");

  // Validate target — only allow http/https navigations
  const isSafe = /^https?:\/\//i.test(target);
  urlEl.textContent = target || "(unknown)";

  // A domain rule is not a measured manipulation score or actor attribution.
  document.getElementById('forensic-score').textContent = 'Not measured';
  document.getElementById('forensic-type').textContent = 'DOMAIN_RULE';
  document.getElementById('forensic-triggers').textContent = 'User-configured blocklist';

  const response = await chrome.runtime.sendMessage({ type: "getSettings" });
  const seconds = response?.settings?.frictionMode === false ? 0 : (response?.settings?.countdownSeconds ?? 12);
  document.getElementById("shield-status").textContent = response?.settings?.enabled ? "Enabled in settings" : "Disabled";

  if (!isSafe || seconds <= 0) {
    // No valid target or no countdown — show override immediately if safe
    countdownEl.textContent = "0";
    countdownEl.classList.add("ready");
    if (isSafe) {
      openBtn.textContent = "Override";
      openBtn.disabled = false;
    } else {
      openBtn.style.display = "none";
    }
  } else {
    let remaining = seconds;
    countdownEl.textContent = String(remaining);
    openBtn.textContent = "Override";

    const interval = window.setInterval(() => {
      remaining -= 1;
      if (remaining > 0) {
        countdownEl.textContent = String(remaining);
        return;
      }
      window.clearInterval(interval);
      countdownEl.textContent = "0";
      countdownEl.classList.add("ready");
      openBtn.disabled = false;
    }, 1000);
  }

  leaveBtn.addEventListener("click", () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.close();
    }
  });

  openBtn.addEventListener("click", async () => {
    if (!isSafe) return; // belt-and-suspenders
    if (openBtn.disabled) return;
    const approved = await chrome.runtime.sendMessage({ type: "authorizeNavigation", target });
    if (approved?.ok) window.location.href = approved.target;
  });
})();

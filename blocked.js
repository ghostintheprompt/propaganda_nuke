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

  const response = await chrome.runtime.sendMessage({ type: "getSettings" });
  const seconds = response?.settings?.countdownSeconds ?? 12;

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

  openBtn.addEventListener("click", () => {
    if (!isSafe) return; // belt-and-suspenders
    window.location.href = target;
  });
})();

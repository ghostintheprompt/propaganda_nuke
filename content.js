(async function () {
  const response = await chrome.runtime.sendMessage({ type: "getSettings" });
  if (!response?.ok || !response.settings?.enabled) return;

  const settings = response.settings;

  // Keyword threshold by intensity
  const scoreThreshold = settings.intensity === "low" ? Infinity
    : settings.intensity === "medium" ? 3
    : 2; // high (default)

  function domainMatches(urlString) {
    try {
      const url = new URL(urlString, location.origin);
      return settings.blockedDomains.some(
        (domain) => url.hostname === domain || url.hostname.endsWith(`.${domain}`)
      );
    } catch {
      return false;
    }
  }

  function keywordScore(text) {
    const lower = (text || "").toLowerCase();
    let score = 0;
    for (const word of settings.manipulativeKeywords) {
      if (lower.includes(word.toLowerCase())) score += 1;
    }
    return score;
  }

  function addBadgeBefore(el, label) {
    if (!el?.parentNode) return;
    const badge = document.createElement("div");
    badge.className = "pn-badge";
    // Use textContent — never innerHTML — to avoid XSS
    badge.textContent = `hidden · ${label}`;
    el.parentNode.insertBefore(badge, el);
  }

  function hideElement(el, reason) {
    if (!el || el.dataset.pnProcessed) return false;
    el.dataset.pnProcessed = "1";
    el.classList.add("pn-hidden");
    addBadgeBefore(el, reason);
    return true;
  }

  function injectBanner(count) {
    if (document.querySelector(".pn-banner")) return;
    const banner = document.createElement("div");
    banner.className = "pn-banner";
    const strong = document.createElement("strong");
    strong.textContent = "propaganda_nuke";
    banner.appendChild(strong);
    banner.appendChild(
      document.createTextNode(` filtered ${count} result${count === 1 ? "" : "s"}.`)
    );
    document.body.prepend(banner);
  }

  function scanLinks() {
    let hidden = 0;

    const links = document.querySelectorAll("a[href]:not([data-pn-scanned])");
    for (const link of links) {
      link.dataset.pnScanned = "1";
      const href = link.getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("javascript:")) continue;

      const container =
        link.closest("div.g") ||
        link.closest("[data-snc]") ||
        link.closest("div[data-hveid]") ||
        link.closest("article") ||
        link.parentElement;

      const text = container?.innerText || link.innerText || "";
      const score = keywordScore(text);
      const blockedDomain = domainMatches(href);

      if (blockedDomain || score >= scoreThreshold) {
        const reason = blockedDomain ? "blocked domain" : `score:${score}`;
        if (hideElement(container, reason)) hidden++;
      }
    }

    if (hidden > 0) {
      chrome.runtime.sendMessage({ type: "incrementStat", key: "hiddenResults" });
      injectBanner(hidden);
    }
  }

  // Page-level block: redirect to friction screen
  if (settings.strictMode && domainMatches(location.href)) {
    chrome.runtime.sendMessage({ type: "incrementStat", key: "blockedPages" });
    window.location.replace(
      chrome.runtime.getURL("blocked.html") +
        "?url=" + encodeURIComponent(location.href)
    );
    return;
  }

  // Intercept clicks on blocked links (capture phase so it fires before site handlers)
  if (settings.frictionMode) {
    document.addEventListener(
      "click",
      (e) => {
        const link = e.target.closest("a[href]");
        if (!link) return;
        const href = link.getAttribute("href");
        if (!href || !domainMatches(href)) return;
        e.preventDefault();
        e.stopImmediatePropagation();
        chrome.runtime.sendMessage({ type: "incrementStat", key: "blockedClicks" });
        const dest = new URL(href, location.origin).href;
        window.location.href =
          chrome.runtime.getURL("blocked.html") + "?url=" + encodeURIComponent(dest);
      },
      true
    );
  }

  // Initial scan
  scanLinks();

  // Watch for dynamic content — debounced so it doesn't fire on every mutation
  let debounceTimer = null;
  const observer = new MutationObserver(() => {
    if (debounceTimer) return;
    debounceTimer = requestAnimationFrame(() => {
      debounceTimer = null;
      scanLinks();
    });
  });
  observer.observe(document.body, { childList: true, subtree: true });
})();

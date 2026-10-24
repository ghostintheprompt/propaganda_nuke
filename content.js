(async function () {
  const response = await chrome.runtime.sendMessage({ type: "getSettings" });
  if (!response?.ok || !response.settings?.enabled) return;

  const settings = response.settings;

  // Keyword threshold by intensity
  const scoreThreshold = settings.intensity === "low" ? Infinity
    : settings.intensity === "medium" ? 3
    : 2; // high (default)

  if (PNCore.whitelisted(location.href, settings)) return;
  const domainMatches = value => {
    try { return PNCore.domainMatches(new URL(value, location.href).href, settings); } catch { return false; }
  };
  const keywordScore = text => settings.manipulativeKeywords.filter(word => PNCore.keywordScore(text, [word]) > 0).length;

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
    const replacement = document.createElement('div');
    replacement.className = 'tox-world-block pn-sun-block';
    replacement.setAttribute('role', 'note');
    const sun = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    sun.setAttribute('width', '120'); sun.setAttribute('height', '120'); sun.setAttribute('viewBox', '0 0 120 120');
    sun.setAttribute('aria-label', 'Sun'); sun.setAttribute('role', 'img');
    const circle = document.createElementNS(sun.namespaceURI, 'circle');
    for (const [key,value] of Object.entries({cx:60,cy:60,r:30,fill:'#FFD700'})) circle.setAttribute(key,value);
    sun.appendChild(circle);
    for (let angle=0;angle<360;angle+=45) {
      const line=document.createElementNS(sun.namespaceURI,'line');
      for (const [key,value] of Object.entries({x1:60,y1:10,x2:60,y2:25,stroke:'#FFD700','stroke-width':3,transform:`rotate(${angle} 60 60)`})) line.setAttribute(key,value);
      sun.appendChild(line);
    }
    const label=document.createElement('p'); label.textContent=`Filtered: ${reason}`;
    const reveal=document.createElement('button'); reveal.textContent='Show this item';
    reveal.addEventListener('click',()=>{ el.classList.remove('pn-hidden'); replacement.remove(); });
    replacement.append(sun,label,reveal);
    el.parentNode.insertBefore(replacement,el);
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
    let totalPageScore = 0;

    const links = document.querySelectorAll("a[href]:not([data-pn-scanned])");
    for (const link of links) {
      link.dataset.pnScanned = "1";
      if (link.closest(".pn-sun-block, .pn-nuke-container, [data-pn-processed]")) continue;
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
      totalPageScore += score;
      const blockedDomain = domainMatches(href);

      if (blockedDomain || score >= scoreThreshold) {
        // Apply leak effect briefly before hiding if score is high
        // Preserve original DOM nodes and event listeners behind the sun replacement.
        
        const reason = blockedDomain ? "blocked domain" : `score:${score}`;
        if (hideElement(container, reason)) hidden++;
      }
    }

    // Comment-like blocks can contain no links at all.
    for (const block of document.querySelectorAll('article, [role="comment"], .comment, [data-comment-id], p')) {
      if (block.closest('.pn-sun-block, .pn-nuke-container, .pn-banner, [data-pn-processed]')) continue;
      if (keywordScore(block.textContent) >= scoreThreshold && hideElement(block, 'keyword threshold')) hidden++;
    }

    // Apply global decay based on total page score
    if (totalPageScore > 20) {
      document.body.classList.add('pn-decay-high');
    } else if (totalPageScore > 5) {
      document.body.classList.add('pn-decay-low');
    }

    if (hidden > 0) {
      chrome.runtime.sendMessage({ type: "incrementStat", key: "hiddenResults", amount: hidden });
      injectBanner(hidden);
    }
  }

  // Page-level block: redirect to friction screen
  const bypass = await chrome.runtime.sendMessage({ type: "consumeNavigation" });
  if (settings.strictMode && domainMatches(location.href) && !bypass?.allowed) {
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

  // Page-level Semantic Nuke
  if (!domainMatches(location.href) && settings.intensity !== "low") {
    const pageText = document.body.innerText;
    const pageScore = window.SemanticNuke.calculateScore(pageText, settings.manipulativeKeywords);
    // Thresholds: High=15, Medium=30, Low=60
    const nukeThreshold = settings.intensity === "high" ? 15 : settings.intensity === "medium" ? 30 : 60;
    
    if (pageScore >= nukeThreshold) {
      const triggers = settings.manipulativeKeywords.filter(word => pageText.toLowerCase().includes(word.toLowerCase()));
      
      // SOC ALERT: Page Neutralization
      window.IncidentManager?.generateAlert("PAGE_NEUTRALIZED", "CRITICAL", {
        score: pageScore,
        threshold: nukeThreshold,
        triggers: triggers,
        url: location.href
      });

      window.SemanticNuke.execute(pageScore, triggers);
    }
  }

  window.pnScanLinks = scanLinks; // Expose for bypass re-scan

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

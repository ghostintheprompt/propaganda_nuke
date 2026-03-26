 (async function () {
   const response = await chrome.runtime.sendMessage({ type: "getSettings" });
   if (!response?.ok || !response.settings?.enabled) return;

   const settings = response.settings;

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
     badge.textContent = label;
     el.parentNode.insertBefore(badge, el);
   }

   function hideElement(el, reason) {
     if (!el || el.dataset.pnProcessed) return false;
     el.dataset.pnProcessed = "1";
     el.classList.add("pn-hidden");
     addBadgeBefore(el, `hidden · ${reason}`);
     return true;
   }

   function injectBanner(message) {
     if (document.querySelector(".pn-banner")) return;
     const banner = document.createElement("div");
     banner.className = "pn-banner";
     banner.innerHTML = `<strong>propaganda_nuke</strong>${message}`;
     document.body.prepend(banner);
   }

   function scanGoogleResults() {
     let hidden = 0;

     const resultLinks = document.querySelectorAll("a[href]");
     for (const link of resultLinks) {
       const href = link.getAttribute("href");
       if (!href) continue;

       const container =
         link.closest("div.g") ||
         link.closest("[data-snc]") ||
         link.closest("div[data-hveid]") ||
         link.closest("article") ||
         link.parentElement;

       const text = container?.innerText || link.innerText || "";
       const score = keywordScore(text);
       const blockedDomain = domainMatches(href);
 })();

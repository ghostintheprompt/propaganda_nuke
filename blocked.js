 (async function () {
   const params = new URLSearchParams(window.location.search);
   const target = params.get("url") || "";
   const urlEl = document.getElementById("blocked-url");
   const countdownEl = document.getElementById("countdown");
   const openBtn = document.getElementById("open-btn");
   const leaveBtn = document.getElementById("leave-btn");

   urlEl.textContent = target;

   const response = await chrome.runtime.sendMessage({ type: "getSettings" });
   const seconds = response?.settings?.countdownSeconds || 12;

   let remaining = seconds;
   countdownEl.textContent = `${remaining}s`;
   openBtn.textContent = `Open anyway · ${remaining}s`;

   const interval = window.setInterval(() => {
     remaining -= 1;
     if (remaining > 0) {
       countdownEl.textContent = `${remaining}s`;
       openBtn.textContent = `Open anyway · ${remaining}s`;
       return;
     }

     window.clearInterval(interval);
     countdownEl.textContent = "0s";
     openBtn.textContent = "Open anyway";
     openBtn.disabled = false;
   }, 1000);

   leaveBtn.addEventListener("click", () => {
     if (window.history.length > 1) {
       window.history.back();
     } else {
       window.close();
     }
   });

   openBtn.addEventListener("click", () => {
     window.location.href = target;
   });
 })();

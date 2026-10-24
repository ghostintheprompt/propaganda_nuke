<p align="center">
  <img src="propaganda_nuke.png" width="520">
</p>

```text
 _______________________________________________________
/                                                       \
|  WARNING: UNAUTHORIZED ACCESS TO THIS TERMINAL WILL   |
|  RESULT IN IMMEDIATE COGNITIVE REDACTION.             |
\_______________________________________________________/
       \   ^__^
        \  (oo)\_______
           (__)\       )\/\
               ||----w |
               ||     ||
```

# [TOP SECRET // NOFORN] PROPAGANDA_NUKE (v0.3.0-GHOST)

**OPERATIONAL DIRECTIVE**: BURN IT ALL DOWN.
**THREAT LEVEL**: CRITICAL (THE ALGORITHM IS BREACHING THE PERIMETER)
**IDENT**: 0xDEADC0DE
**ENCRYPTION**: MULTIPLE-LAYERS-OF-PARANOIA

---

## // EXECUTIVE SUMMARY

The "Information Superhighway" is a radioactive wasteland. They aren't articles; they are **weaponized cognitive payloads** designed to harvest your outrage and sell your anxiety to the highest bidder. 

`propaganda_nuke` is not a filter. It is a **thermonuclear first strike** against the engagement economy. We don't fact-check. We drop a payload of friction directly onto the limbic system.

---

## // ARSENAL & ORDNANCE

| WEAPON SYSTEM | DESIGNATION | DAMAGE REPORT |
| :--- | :--- | :--- |
| **RAD_SHIELD** | `SCORCHED_EARTH_NET` | Strips the named tracking parameters in `core.js` and blocks two narrow request patterns. The master switch disables these rules. |
| **SEMANTIC_NUKE** | `FEAR_EATER_3.0` | Counts configured keywords locally, then inserts a sun replacement or page overlay at the selected threshold. No sentiment model or fact-checker. |
| **FRICTION_GATE** | `THE_WAITING_ROOM` | Slaps a 12,000ms latency on known doomscrolling traps. Breathe. |
| **DECAY_OS** | `VISUAL_TOXICITY` | UI physically rots, jitters, and bleeds neon colors as the page's propaganda density spikes. |
| **FORENSIC_VAULT** | `THE_BLACK_BOX` | Last 100 page-pause and domain-override records in editable local storage, with SHA-256 checksums. Not immutable or digitally signed. |

---

## // ARMING SEQUENCE [DEV_MODE]

You want the launch codes? Fine.

1. Clone this repository into your underground bunker.
2. Breach your browser's security mainframe (`chrome://extensions`).
3. Rip the duct tape off **Developer mode**.
4. Punch **Load unpacked** and select the `propaganda_nuke` directory.
5. Pray.

---

## // RULES OF ENGAGEMENT

*   **PEACE WAS NEVER AN OPTION**: The page overlay triggers when the configured keyword-count threshold is reached. Low intensity disables keyword filtering.
*   **COLLATERAL DAMAGE**: Filtered items get a sun replacement. Revealing an item or dismissing the page overlay preserves the original DOM nodes and their listeners.
*   **THE RED BUTTON (Bypass)**: A domain override is logged and admits one exact destination in one tab, once. The Black Box remembers the decision, not your motives.

---

## // VERIFIED BOUNDARY

`tox-world.md` on Ghost links here. The local sun replacement and domain whitelist are implemented; the article's optional AI second opinion is not. Whitelisted pages skip DOM filtering, while enabled network rules still strip the listed parameters and block the two configured request patterns.

Keyword filtering inspects linked result containers and common text/comment blocks (`article`, `[role="comment"]`, `.comment`, `[data-comment-id]`, and `p`). It does not classify intent, verify claims, read closed shadow roots or cross-origin frames, or guarantee coverage of every site's comment markup. Added DOM content is rescanned; already-scanned link text is not continuously reclassified. Existing pages should be reloaded after changing filtering settings.

The countdown defaults to 12 seconds and can be set to zero. News/social toggles control their preset domain groups; custom blocked domains remain active. Managed settings override user preferences. The vault is bounded and editable; anyone able to edit its records can recompute an unkeyed checksum. Browser sync may synchronize settings and counters; incidents stay in local extension storage. No AI API or telemetry endpoint is called.

The standalone `counter_measures/scenarios.js` file contains manual DOM/metadata demonstration helpers. It is not loaded by the installed extension, and no scenario modifies live page text automatically.

Run the shipped-code checks with:

```bash
node --test tests/simulation.js
```

For the isolated Chromium integration test, install the development dependency and its browser, then run:

```bash
npm install
npx playwright install chromium
npm run test:browser
```

The browser check uses a temporary profile and local HTTP fixture. It tests the actual Manifest V3 extension, not your signed-in browser.

## // UPCOMING ORDNANCE

*   [ ] **Geiger Audio**: Auditory clicking as the radiation spikes. (Because why not induce panic while fighting panic?)
*   [ ] **Social Sector Lockdown**: Hardening the perimeter against Infinite Scroll algorithms.
*   [ ] **Intel SitRep**: A daily readout of how much of your brain we saved today.

---

## // FINAL WARNING

Deploying `propaganda_nuke` is an act of digital hostility. It is opinionated, sardonic, and gives zero cares about "narrative fidelity." It exists only to defend the sovereign borders of your prefrontal cortex.

**[SYSTEM STATUS: ARMED]**
**[LICENSE: MIT // DO_NOT_COMPLY]**
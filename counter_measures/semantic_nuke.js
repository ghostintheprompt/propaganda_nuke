/**
 * Semantic Nuke Engine
 * Handles detection of high-velocity outrage patterns and page-level neutralization.
 */
const SemanticNuke = {
  calculateScore: (text, keywords) => {
    if (!text) return 0;
    const lowerText = text.toLowerCase();
    let score = 0;
    keywords.forEach(word => {
      const regex = new RegExp(`\\b${word.toLowerCase()}\\b`, 'g');
      const matches = lowerText.match(regex);
      if (matches) {
        score += matches.length;
      }
    });
    return score;
  },

  getNukeTemplate: (score, triggers) => {
    return `
      <div class="pn-nuke-container">
        <div class="pn-nuke-content">
          <pre class="pn-ascii-art">
          ☢️ RADIATION WARNING ☢️
          
          PAGE NEUTRALIZED: HIGH PROPAGANDA DENSITY DETECTED
          -------------------------------------------------
          THREAT LEVEL: CRITICAL
          BIAS INTEGRITY SCORE: ${Math.max(0, 100 - score * 5)}%
          DETECTED TRIGGERS: ${triggers.slice(0, 5).join(', ')}...
          
          [REDACTED FOR YOUR MENTAL HEALTH]
          
          The information environment here has been deemed 
          hostile to cognitive autonomy.
          
          - PRO-TIP: TAKE A DEEP BREATH. 
          - REALITY IS NOT AS SCARY AS THE ALGORITHM WANTS YOU TO THINK.
          </pre>
          <button id="pn-bypass-nuke" class="pn-btn-secondary">Decontaminate & Enter (Risky)</button>
        </div>
      </div>
    `;
  },

  execute: (score, triggers) => {
    console.warn(`[Propaganda Nuke] Critical threshold exceeded. Score: ${score}`);
    const originalContent = document.body.innerHTML;
    document.body.innerHTML = SemanticNuke.getNukeTemplate(score, triggers);
    document.body.classList.add('pn-nuked');
    
    document.getElementById('pn-bypass-nuke')?.addEventListener('click', () => {
      document.body.innerHTML = originalContent;
      document.body.classList.remove('pn-nuked');
      // Re-scan links after bypass to keep badges
      if (window.pnScanLinks) window.pnScanLinks();
    });
  }
};

// Make it available to content.js
window.SemanticNuke = SemanticNuke;

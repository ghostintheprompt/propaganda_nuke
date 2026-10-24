/** Local keyword threshold. No sentiment model or factual accuracy scoring. */
const SemanticNuke = {
  calculateScore: (text, keywords) => PNCore.keywordScore(text, keywords),
  execute(score, triggers) {
    if (document.getElementById('pn-nuke-overlay')) return;
    const overlay = document.createElement('div');
    overlay.id = 'pn-nuke-overlay';
    overlay.className = 'pn-nuke-container';
    overlay.setAttribute('role','dialog');
    overlay.setAttribute('aria-label','Keyword threshold reached');
    const content = document.createElement('div'); content.className='pn-nuke-content';
    const text=document.createElement('pre'); text.className='pn-ascii-art';
    text.textContent=`PAGE PAUSED\nKeyword matches: ${score}\nTriggers: ${triggers.slice(0,5).join(', ')}\n\nA keyword threshold is not a verdict on the story.`;
    const button=document.createElement('button');button.id='pn-bypass-nuke';button.className='pn-btn-secondary';button.textContent='Continue reading';
    button.addEventListener('click',()=>overlay.remove());
    content.append(text,button);overlay.appendChild(content);document.body.appendChild(overlay);button.focus();
  }
};
window.SemanticNuke = SemanticNuke;

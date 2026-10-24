/** Bounded local incident ledger. Checksums are not signatures or immutability. */
const IncidentManager = {
  async generateAlert(type, severity, metadata) {
    const response = await chrome.runtime.sendMessage({ type: 'appendIncident', incident: { type, severity, metadata } });
    if (!response?.ok) throw new Error(response?.error || 'Incident was not saved');
    return response.alert;
  },
  async getVault() {
    const response = await chrome.runtime.sendMessage({ type: 'getVault' });
    if (!response?.ok) throw new Error(response?.error || 'Vault unavailable');
    return response.vault;
  }
};
window.IncidentManager = IncidentManager;

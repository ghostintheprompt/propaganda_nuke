/**
 * Incident Manager (Defensive SOC Engine)
 * Handles structured alerting and tamper-evident logging of IO events.
 * Mandate: UIP V1.5 - Reproducible forensic logic.
 */
const IncidentManager = {
  /**
   * Generates a signed Incident Report.
   */
  async generateAlert(type, severity, metadata) {
    const incidentId = `INC-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 1000)}`;
    const alert = {
      incident_id: incidentId,
      timestamp: new Date().toISOString(),
      type: type,
      severity: severity,
      metadata: metadata,
      integrity_protocol: "UIP-V1.5"
    };

    // Sign the alert using the FalloutMap primitive
    if (window.FalloutMap && window.FalloutMap.sign) {
      alert.signature = await window.FalloutMap.sign(JSON.stringify(alert));
    }

    console.error(`[SOC ALERT] ${incidentId} | ${type} | Severity: ${severity}`);
    
    // Persist to the Forensic Vault
    await this.logToVault(alert);
    
    return alert;
  },

  /**
   * Persists alert to local storage (Forensic Vault).
   */
  async logToVault(alert) {
    try {
      const data = await chrome.storage.local.get("forensic_vault");
      const vault = data.forensic_vault || [];
      vault.push(alert);
      // Keep only last 100 incidents for performance
      if (vault.length > 100) vault.shift();
      await chrome.storage.local.set({ forensic_vault: vault });
    } catch (err) {
      console.error("Failed to write to Forensic Vault:", err);
    }
  },

  /**
   * Retrieves the vault for audit.
   */
  async getVault() {
    const data = await chrome.storage.local.get("forensic_vault");
    return data.forensic_vault || [];
  }
};

window.IncidentManager = IncidentManager;

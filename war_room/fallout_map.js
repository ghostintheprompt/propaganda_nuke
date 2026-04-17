/**
 * Fallout Map Utility
 * Generates signed forensic logs of blocked Influence Operation (IO) domains.
 */
const FalloutMap = {
  /**
   * Generates a SHA-256 signature for a given text.
   */
  async sign(text) {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
  },

  /**
   * Prepares and downloads the fallout log.
   */
  async export(settings) {
    const logData = {
      timestamp: new Date().toISOString(),
      agent: "Propaganda Nuke v0.2.0",
      threat_actor_list: settings.blockedDomains,
      stats: settings.stats,
      decontamination_active: true,
      integrity_check: "SHA-256"
    };

    const payload = JSON.stringify(logData, null, 2);
    const signature = await this.sign(payload);
    
    const finalLog = {
      ...logData,
      signature: signature,
      attribution: "Forensic record generated for cognitive security audit."
    };

    const blob = new Blob([JSON.stringify(finalLog, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fallout_map_${new Date().getTime()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }
};

window.FalloutMap = FalloutMap;

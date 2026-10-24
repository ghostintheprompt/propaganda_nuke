/**
 * Fallout Map Utility
 * Exports configured domains and counters with an unkeyed SHA-256 checksum.
 */
const FalloutMap = {
  /**
   * Computes a SHA-256 checksum; this is not a digital signature.
   */
  async checksum(text) {
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
      agent: "Propaganda Nuke v0.3.0",
      configured_domains: settings.blockedDomains,
      stats: settings.stats,
      integrity_check: "SHA-256",
      attribution: "Local configuration snapshot; not proof of influence operations or authenticated origin."
    };

    const payload = JSON.stringify(logData, null, 2);
    const checksum = await this.checksum(payload);
    
    const finalLog = {
      ...logData,
      checksum: checksum
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

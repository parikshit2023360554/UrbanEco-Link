import apiClient from './api';

/**
 * Pillar 1: Bulk Waste Management API Services
 */
export const bwgService = {
  /**
   * Log daily bulk waste bag volume
   * @param {object} wasteData - { stream_category: 'WET'|'DRY'|'SANITARY'|'HAZARDOUS', estimated_volume_liters: number, notes?: string }
   */
  async logWaste(wasteData) {
    return await apiClient.post('/bwg/waste-log', wasteData);
  },

  /**
   * Fetch 30-day compliance report and CPCB SWM 2026 status metrics
   */
  async getComplianceReport() {
    return await apiClient.get('/bwg/compliance-report');
  },
};

export default bwgService;

import apiClient from './api';

/**
 * Pillar 3: Anti-Fraud & Task Engine API Services
 */
export const taskService = {
  /**
   * NGO claims/assigns a civic waste report for cleanup
   * @param {number} reportId 
   */
  async assignTask(reportId) {
    return await apiClient.post('/tasks/assign', { report_id: reportId });
  },

  /**
   * Submit 'After' cleanup photo & GPS coordinates for anti-fraud proximity verification (<10m tolerance)
   * @param {object} verificationData - { report_id: number, latitude: number, longitude: number, after_image_url: string }
   */
  async verifyCleanup(verificationData) {
    return await apiClient.post('/tasks/verify-cleanup', verificationData);
  },
};

export default taskService;

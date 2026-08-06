import apiClient from './api';

/**
 * Pickup & QR Lifecycle API Service Integration
 */
export const pickupService = {
  /**
   * Request a new waste pickup (BWG / Society Portal)
   * @param {object} payload - { stream_category, estimated_weight_kg }
   */
  async requestPickup(payload) {
    return await apiClient.post('/pickups/request', payload);
  },

  /**
   * Fetch pickups for society portal
   */
  async getSocietyPickups() {
    return await apiClient.get('/pickups/society');
  },

  /**
   * Fetch all pickups for Administrative Portal
   */
  async getAdminPickups() {
    return await apiClient.get('/pickups/admin/all');
  },

  /**
   * Fetch active pickups for Delivery Partner Portal
   */
  async getDeliveryPartnerPickups() {
    return await apiClient.get('/pickups/delivery-partner');
  },

  /**
   * Scan waste bin QR code token (Delivery Partner Portal)
   * @param {string} qrCodeToken - Token e.g. "QR_WET_89234"
   */
  async scanQR(qrCodeToken) {
    return await apiClient.post('/pickups/scan-qr', { qr_code_token: qrCodeToken });
  },

  /**
   * Fetch incoming shipments (Factory Dashboard)
   */
  async getFactoryIncoming() {
    return await apiClient.get('/pickups/factory/incoming');
  },

  /**
   * Complete factory intake (mark as DELIVERED)
   * @param {number} pickupId
   */
  async completePickup(pickupId) {
    return await apiClient.put(`/pickups/${pickupId}/complete`, {});
  },

  /**
   * Assign driver to pickup request
   * @param {number} pickupId
   * @param {string} driverName
   */
  async assignDriver(pickupId, driverName) {
    return await apiClient.put(`/pickups/${pickupId}/assign`, { assigned_driver: driverName });
  },
};

export default pickupService;

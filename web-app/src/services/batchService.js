import apiClient from './api';

/**
 * Batch Creation, QR Scanning & Eco-Points API Service
 */
export const batchService = {
  /**
   * Step 1: Create Waste Batch (Society Portal)
   * @param {object} payload - { stream_category: 'WET'|'DRY'|'HAZARDOUS', weight_kg: number }
   */
  async createBatch(payload) {
    return await apiClient.post('/batches/create', payload);
  },

  /**
   * Fetch Society's Batches & Eco-Points
   */
  async getMyBatches() {
    return await apiClient.get('/batches/my-batches');
  },

  /**
   * Step 2: Delivery Partner QR Scan (Mark IN_TRANSIT)
   * @param {string} qrCode - Token e.g. "QR_WET_89234"
   */
  async deliveryScan(qrCode) {
    return await apiClient.post('/batches/delivery-scan', { qr_code: qrCode });
  },

  /**
   * Fetch Active Pickups for Delivery Partner
   */
  async getDeliveryActive() {
    return await apiClient.get('/batches/delivery-active');
  },

  /**
   * Step 3: Factory QR Verification & Eco-Points Transaction (Mark COMPLETED & Award 50 Points)
   * @param {string|object} qrCode - QR code string or object with pickupId
   */
  async factoryScan(qrCode) {
    const payload = typeof qrCode === 'string' ? { qr_code: qrCode } : qrCode;
    return await apiClient.post('/batches/factory-scan', payload);
  },

  /**
   * Fetch Incoming Shipments for Factory (IN_TRANSIT)
   */
  async getFactoryIncoming() {
    return await apiClient.get('/batches/factory-incoming');
  },

  /**
   * Fetch Completed Shipments for Factory (COMPLETED)
   */
  async getFactoryCompleted() {
    return await apiClient.get('/batches/factory-completed');
  },
};

export default batchService;

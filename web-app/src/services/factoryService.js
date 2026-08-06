import apiClient from './api';

export const factoryService = {
  getShipments: async () => {
    return await apiClient.get('/factory/shipments');
  },

  updateSettings: async (settingsData) => {
    return await apiClient.put('/factory/settings', settingsData);
  },

  confirmDelivery: async (payload) => {
    return await apiClient.post('/factory/confirm-delivery', payload);
  },

  getStats: async () => {
    return await apiClient.get('/factory/stats');
  },
};

export default factoryService;

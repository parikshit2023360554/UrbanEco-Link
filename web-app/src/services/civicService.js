import apiClient from './api';

/**
 * Pillar 2: Crowdsourced Geofenced Civic Reports API Services
 */
export const civicService = {
  /**
   * File a street waste report with GPS coordinates & photo URL
   * @param {object} reportData - { latitude: number, longitude: number, before_image_url: string, description?: string, waste_type?: string }
   */
  async submitReport(reportData) {
    return await apiClient.post('/civic/report', reportData);
  },

  /**
   * Fetch all filed civic reports (Admin / NGO Portal)
   */
  async getReports() {
    return await apiClient.get('/civic/reports');
  },

  /**
   * Fetch open civic reports within radius (meters) using PostGIS ST_DWithin
   * @param {number} latitude 
   * @param {number} longitude 
   * @param {number} radiusMeters - Default 2000m (2km)
   */
  async fetchNearbyTasks(latitude, longitude, radiusMeters = 2000) {
    return await apiClient.get('/civic/nearby-tasks', {
      params: {
        latitude,
        longitude,
        radius: radiusMeters,
      },
    });
  },
};

export default civicService;

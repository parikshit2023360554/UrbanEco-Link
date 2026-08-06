/**
 * PostGIS Spatial Query Helpers & Geofencing Utilities
 */

/**
 * Validates GPS Latitude and Longitude values
 * @param {number} lat - Latitude (-90 to 90)
 * @param {number} lng - Longitude (-180 to 180)
 * @returns {boolean}
 */
export const isValidCoordinates = (lat, lng) => {
  return (
    typeof lat === 'number' &&
    typeof lng === 'number' &&
    !isNaN(lat) &&
    !isNaN(lng) &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180
  );
};

/**
 * Returns SQL parameter snippet for PostGIS geography creation
 * PostGIS uses WGS84 coordinates: ST_MakePoint(longitude, latitude)::geography
 * Note: Longitude precedes Latitude in PostGIS ST_MakePoint($lng, $lat)!
 * 
 * @param {number} lngParamIdx - Parameter index for longitude ($1, $2, etc.)
 * @param {number} latParamIdx - Parameter index for latitude
 * @returns {string} SQL Fragment
 */
export const getMakePointSQL = (lngParamIdx, latParamIdx) => {
  return `ST_MakePoint($${lngParamIdx}, $${latParamIdx})::geography`;
};

/**
 * Haversine formula calculation in pure JS for fallback or pre-query checks
 * @param {number} lat1 
 * @param {number} lon1 
 * @param {number} lat2 
 * @param {number} lon2 
 * @returns {number} Distance in meters
 */
export const calculateHaversineDistanceMeters = (lat1, lon1, lat2, lon2) => {
  const R = 6371000; // Earth's radius in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 100) / 100;
};

// Anti-fraud GPS proximity tolerance threshold (10 meters)
export const MAX_CLEANUP_PROXIMITY_METERS = 10.0;

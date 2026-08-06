import S2 from 's2-geometry';

/**
 * Convert latitude and longitude to an S2 Cell Token / Key
 * @param {number|string} lat - Latitude
 * @param {number|string} lng - Longitude
 * @param {number} level - S2 Cell Level (default = 13)
 * @returns {string} S2 Cell Token
 */
export const getS2Token = (lat, lng, level = 13) => {
  const parsedLat = parseFloat(lat);
  const parsedLng = parseFloat(lng);

  if (isNaN(parsedLat) || isNaN(parsedLng)) {
    throw new Error('Invalid coordinates supplied for getS2Token.');
  }

  const key = S2.S2.latLngToKey(parsedLat, parsedLng, level);
  try {
    const idStr = S2.S2.keyToId(key);
    return BigInt(idStr).toString(16).toLowerCase();
  } catch {
    return key;
  }
};

/**
 * Get origin S2 Cell Token plus its surrounding edge neighbors
 * @param {number|string} lat - Latitude
 * @param {number|string} lng - Longitude
 * @param {number} level - S2 Cell Level (default = 13)
 * @returns {string[]} Array containing origin S2 token + 8 surrounding neighbors
 */
export const getS2CellWithNeighbors = (lat, lng, level = 13) => {
  const parsedLat = parseFloat(lat);
  const parsedLng = parseFloat(lng);

  if (isNaN(parsedLat) || isNaN(parsedLng)) {
    throw new Error('Invalid coordinates supplied for getS2CellWithNeighbors.');
  }

  const originKey = S2.S2.latLngToKey(parsedLat, parsedLng, level);
  const neighborKeys = S2.S2.latLngToNeighborKeys(parsedLat, parsedLng, level) || [];

  const allKeys = [originKey, ...neighborKeys];

  const tokens = allKeys.map((k) => {
    try {
      const idStr = S2.S2.keyToId(k);
      return BigInt(idStr).toString(16).toLowerCase();
    } catch {
      return k;
    }
  });

  // Combine both hex tokens and S2 quadkeys for maximum matching flexibility
  const uniqueSet = new Set([...tokens, ...allKeys]);
  return Array.from(uniqueSet);
};

/**
 * Compute Haversine distance in kilometers between two GPS points
 * @param {number|string} lat1 - Origin Latitude
 * @param {number|string} lon1 - Origin Longitude
 * @param {number|string} lat2 - Destination Latitude
 * @param {number|string} lon2 - Destination Longitude
 * @returns {number} Distance in Kilometers (rounded to 3 decimal places)
 */
export const getHaversineDistanceKm = (lat1, lon1, lat2, lon2) => {
  const pLat1 = parseFloat(lat1);
  const pLon1 = parseFloat(lon1);
  const pLat2 = parseFloat(lat2);
  const pLon2 = parseFloat(lon2);

  if (isNaN(pLat1) || isNaN(pLon1) || isNaN(pLat2) || isNaN(pLon2)) {
    return 0;
  }

  const R = 6371; // Earth Radius in Kilometers
  const dLat = ((pLat2 - pLat1) * Math.PI) / 180;
  const dLon = ((pLon2 - pLon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((pLat1 * Math.PI) / 180) *
      Math.cos((pLat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return parseFloat((R * c).toFixed(3));
};

export default {
  getS2Token,
  getS2CellWithNeighbors,
  getHaversineDistanceKm,
};

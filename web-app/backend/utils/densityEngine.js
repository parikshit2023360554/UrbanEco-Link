/**
 * Statutory Density Coefficients Engine under India's Solid Waste Management (SWM) Rules 2026.
 * Standardized density factors convert waste bag volume (Liters) to mass (Kilograms).
 */

export const DENSITY_COEFFICIENTS = {
  WET: 0.40,       // Organic, food scraps, kitchen waste (~0.40 kg/L)
  DRY: 0.15,       // Recyclables, plastics, paper, cardboard (~0.15 kg/L)
  SANITARY: 0.25,  // Biomedical/hygiene waste (~0.25 kg/L)
  HAZARDOUS: 0.35, // Batteries, e-waste, chemical containers (~0.35 kg/L)
};

// Statutory threshold for Bulk Waste Generators (BWG) under SWM 2026 Rules (100 kg/day)
export const STATUTORY_BWG_THRESHOLD_KG = 100.0;

/**
 * Calculates mass in Kilograms (KG) based on waste stream category and bag volume in Liters.
 * 
 * @param {string} category - Stream Category ('WET', 'DRY', 'SANITARY', 'HAZARDOUS')
 * @param {number} volumeLiters - Volume in Liters
 * @returns {object} { mass_kg, coefficient }
 */
export const calculateMass = (category, volumeLiters) => {
  const upperCategory = (category || '').toUpperCase();
  const coefficient = DENSITY_COEFFICIENTS[upperCategory] || 0.30;
  
  const massKg = parseFloat((volumeLiters * coefficient).toFixed(2));

  return {
    mass_kg: massKg,
    coefficient,
  };
};

/**
 * Checks if total daily generated waste exceeds the statutory 100kg/day Bulk Waste Generator threshold.
 * Triggers mandatory on-site processing alert under SWM 2026.
 * 
 * @param {number} totalDailyKg - Total daily accumulated mass in KG
 * @returns {object} { isBWG, thresholdKg: 100, alertMessage: string }
 */
export const checkBWGCapacityThreshold = (totalDailyKg) => {
  const isBWG = totalDailyKg >= STATUTORY_BWG_THRESHOLD_KG;
  
  return {
    isBWG,
    thresholdKg: STATUTORY_BWG_THRESHOLD_KG,
    alertTriggered: isBWG,
    alertMessage: isBWG
      ? `🚨 CAPACITY ALERT: Daily waste output (${totalDailyKg} kg) exceeds statutory SWM 2026 Bulk Waste Generator threshold (100 kg/day). Mandatory on-site composting/biodigestion required.`
      : `✅ COMPLIANT: Daily waste output (${totalDailyKg} kg) is within allowable limit (<100 kg/day).`,
  };
};


export const LAND_UNITS = {
  ROPANI: {
    base: 508.72,
    AANA: 16,
    PAISA: 4,
    DAAM: 4
  },
  BIGHA: {
    base: 6772.63,
    KATTHA: 20,
    DHUR: 20
  }
};

/**
 * Calculates total Square Meters from Ropani system
 */
export const convertRopaniToSqm = (r, a, p, d) => {
  return (r * 508.72) + (a * 31.80) + (p * 7.95) + (d * 1.99);
};

/**
 * Calculates total Square Meters from Bigha system
 */
export const convertBighaToSqm = (b, k, dh) => {
  return (b * 6772.63) + (k * 338.63) + (dh * 16.93);
};

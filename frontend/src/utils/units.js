/**
 * Nepal Land Area Conversion Utilities
 * 
 * Base unit: Square Meters (sqm)
 */

export const UNITS = {
  SQM: 'sqm',
  ROPANI: 'ropani',
  BIGHA: 'bigha'
};

export const convertArea = (sqm, unit) => {
  if (!sqm) return "0";
  const area = parseFloat(sqm);
  
  switch (unit) {
    case UNITS.ROPANI:
      return (area / 508.72).toFixed(2);
    case UNITS.BIGHA:
      return (area / 6772.63).toFixed(2);
    case UNITS.SQM:
    default:
      return area.toFixed(2);
  }
};

export const getUnitLabel = (unit) => {
  switch (unit) {
    case UNITS.ROPANI: return "Ropani";
    case UNITS.BIGHA: return "Bigha";
    case UNITS.SQM: return "sq. m.";
    default: return "sq. m.";
  }
};

export const convertToBases = (value, unit) => {
    const units = {
        'bp': 1,
        'Kb': 1e3,
        'Mb': 1e6
    };

    return value * (units[unit] || 1);
};

export const convertFromBp = (bpValue, targetUnit) => {
    // Define how many base pairs are in each unit
    const units = {
      bp: 1,
      Kb: 1e3,
      Mb: 1e6,
      Gb: 1e9
    };
  
    // Fallback to 'bp' if the targetUnit is not recognized
    const divisor = units[targetUnit] || units.bp;
    
    // Return the value in the requested unit
    return bpValue / divisor;
  };
  

export function isWholeNumberWithNoDecimal(num) {
    var number = Number(num);
    return number === Math.floor(number);
};
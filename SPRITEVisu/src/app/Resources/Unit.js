export const convertToBases = (value, unit) => {
    const units = {
        'bp': 1,
        'Kb': 1e3,
        'Mb': 1e6
    };

    return value * (units[unit] || 1);
};

export function isWholeNumberWithNoDecimal(num) {
    var number = Number(num);
    return number === Math.floor(number);
};
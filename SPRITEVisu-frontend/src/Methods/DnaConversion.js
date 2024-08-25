// console.log(dnaConversion.convert(1, 'Mb'));
export const dnaConversion = {
    mbToBp: function(mb) {
        return mb * 1e6;
    },
    kbToBp: function(kb) {
        return kb * 1e3;
    },
    gbToBp: function(gb) {
        return gb * 1e9;
    },
    bpToBp: function(bp) {
        return bp;
    },
    convert: function(value, unit) {
        switch(unit.toLowerCase()) {
            case 'mb':
                return this.mbToBp(value);
            case 'kb':
                return this.kbToBp(value);
            case 'gb':
                return this.gbToBp(value);
            case 'bp':
                return this.bpToBp(value);
            default:
                throw new Error('Invalid unit. Please use "Mb", "Kb", "Gb", or "bp".');
        }
    }
};
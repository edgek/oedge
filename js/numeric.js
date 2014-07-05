/**
 * numeric.js
 *
 * This script defines a Numeric object. Numeric contains misc mathematical and
 * processing functions. Numeric is not meant to be used as a class.    
 *
**/

'use strict';

var Numeric = {};

// Error function
Numeric.erf = function (x) {
    // save the sign of x
    var sign = (x >= 0) ? 1 : -1;
    
    // constants
    var a1 =  0.254829592,
        a2 = -0.284496736,
        a3 =  1.421413741,
        a4 = -1.453152027,
        a5 =  1.061405429,
        p  =  0.3275911;

    x = Math.abs(x);

    // A&S formula 7.1.26
    var t = 1.0/(1.0 + p*x);
    var y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
    return sign * y; // erf(-x) = -erf(x);
};

// Cummulative distribution function
Numeric.cdf = function (x, mean, stddev) {
    return 0.5 * (1 + Numeric.erf((x - mean) / (Math.sqrt(2 * Math.pow(stddev,2)))));  // not using this
};

// Probability distribution function
Numeric.pdf = function (x) {
    return (1/Math.sqrt(2*Math.PI))*(Math.exp(-0.5*Math.pow(x,2)));
};

// Returns the sign of a number
Numeric.sign = function (x) {
    return x > 0 ? 1 : x < 0 ? -1 : 0;
};

Numeric.sum = function (arr) {
    var sum = arr[0],
        arrlen = arr.length,
        i;

    for (i = 1; i < arrlen; i++) {
        sum += arr[i];
    }
    return sum;
};

Numeric.round = function (i, j) {
    return Math.round(i * j) / j;
};

Numeric.addDollarSign = function (str) {
    return str.replace(/^(-)?(\d+\.\d+)/, '$1$$$2');
};

Numeric.makeTodayDate = function () {
    var d1 = new Date(),
        d2 = new Date(d1.getFullYear(), d1.getMonth(), d1.getDate());
    return d2;
};

Numeric.dateDiff = function (d2, d1) {
    if (typeof d1 === 'string') {
        d1 = new Date(d1);
        d2 = new Date(d2);
    }
    return ((((d2 - d1) / 1000) / 60) / 60) / 24;
};

Numeric.testFloat = function (n) {
    return /^\s*\d+\.?\d*\s*$/.test(n);
};

Numeric.testInt = function (n) {
    return /^\s*\d+\s*$/.test(n);
};

Numeric.testDate = function (s) {
    return /^\s*\d+\/\d+\/\d\d\d\d\s*$/.test(s);
};

Numeric.convInt = function (s) {
    var rc = /^\s*\d+\s*$/.test(s),
        n;

    if (rc) {
        n = Number(s);
        if (n > 0) {
            return n;
        }
    }

    return undefined;
};

Numeric.convFloat = function (s) {
    var rc = /^\s*\d*\.?\d*\s*$/.test(s);
    var n;

    if (rc) {
        n = Number(s);
        if (n > 0) {
            return n;
        }
    }
    
    return undefined;
};

Numeric.getConvDate = function (s) {
    var sDate, todayDate;

    s = s.replace(/\s/g, '');

    if (/^\d+\/\d+\/\d\d\d\d$/.test(s)) {
        sDate = new Date(s);
        todayDate = Numeric.makeTodayDate();
        
        if (sDate.getTime() >= todayDate.getTime()) {
            return s;
        }
    }

    return undefined;
};

Numeric.convPct = function (s) {
    var n;

    if (/^\s*\d*\.?\d*%\s*$/.test(s)) {
        return Number(s.replace('%', '')) / 100;
    }
    if (/^\s*\d*\.?\d*\s*$/.test(s)) {
        return Number(s);
    }

    return undefined;
};

Numeric.getMax = function (arr) {
    return Math.max.apply(null, arr);
};

Numeric.getMin = function (arr) {
    return Math.min.apply(null, arr);
};

Numeric.formatPercent = function (n) {
    if (n === undefined) {
        return '--';
    }
    return Numeric.round(n * 100, 100).toFixed(2) + '%';
}

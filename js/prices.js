/**
 * prices.js
 *
 * This script defines a Prices object. Prices maintains the underlying prices
 * of a strategy.      
 *
**/

'use strict';

if (!oedge) {
    var oedge = {};
}

oedge.Prices = function () {
    this.prices = [];
    this.max = undefined;
    this.min = 0;
    this.lower = undefined;
    this.upper = undefined;
    this.nobs = undefined;
    this.priceMult = 1.5; // Used to calculate max for sliders typically. 
    this.numeric = Numeric;
    this.dec = 100; // The number of decimals for rounding prices.
};

oedge.Prices.prototype.clear = function () {
    this.prices = [];
    this.max = undefined;
    this.min = 0;
    this.lower = undefined;
    this.upper = undefined;
    this.nobs = undefined;
};

oedge.Prices.prototype.init = function (lower, upper, nobs, extraPoints) {
    this.clear();
    this.setPrices(lower, upper, nobs, extraPoints);
};

// Returns prices based on lower bound, upper bound, expected obs, and 
// desired points. Takes the input parameters and fills in other prices to make 
// it a smooth range 
oedge.Prices.prototype.setPrices = function (lower, upper, nobs, extraPoints) {
    var round = this.numeric.round,
        dec = this.dec,
        arr = [],
        i, dmax, d, i1, n0, n1;

    // Return if price parameters are not apropriate.
    if (!(typeof lower === 'number' && lower >= 0)) {
        return false;
    }

    if (!(typeof upper === 'number' && upper >= 0)) {
        return false;
    }

    if (!(typeof nobs === 'number' && nobs > 0)) {
        return false;
    }

    if (lower > upper) {
        upper = lower;
    }

    // Push lower and upper bounds
    arr.length < nobs && arr.push(lower);
    arr.length < nobs && arr.push(upper);

    // Check that extraPoints are in range, and push
    for (i = 0; i < extraPoints.length; i++) {
        if (extraPoints[i] >= lower && extraPoints[i] <= upper && arr.length < nobs) {
            arr.indexOf(extraPoints[i]) === -1 && arr.push(extraPoints[i]);
        }
    }

    // Sort ascending
    arr.sort(function (a, b) {return a - b;});

    while (arr.length < nobs) {
        dmax = 0;    // The largest difference between 2 elements in array
        n0 = arr[0]; // The leftward price
        i1 = 0;      // The rightward element of the largest difference between 2 elements in array.

        for (i = 1; i < arr.length; i++) {
            n1 = arr[i]; // The rightward price
            d = n1 - n0;
            if (d > dmax) {
                dmax = d;
                i1 = i;
            }
            n0 = n1;
        }
        if (i1 > 0) {
            arr.splice(i1, 0, round(arr[i1 - 1] + ((arr[i1] - arr[i1 - 1]) / 2), dec));
        } else {
            arr.push(round(n0, dec));
        }
    }

    this.prices = arr;
    this.lower = arr[0];
    this.upper = arr[arr.length - 1];
    this.nobs = arr.length;

    // Set this.max
    // Max should be upper since extraPoints will always be within.
    if (!this.max) {
        this.max = round(this.upper * this.priceMult, dec);
    } else if (this.upper > this.max) {
        this.max = this.upper;
    }

    return true;
};

oedge.Prices.prototype.getPrices = function () {
    return this.prices;
};

oedge.Prices.prototype.getPricesRange = function () {
    return {lower: this.lower, upper: this.upper, min: this.min, max: this.max, nobs: this.nobs};
};

oedge.Prices.prototype.getMax = function () {
    return this.numeric.getMax(this.prices);
};

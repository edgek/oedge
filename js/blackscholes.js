/**
 * blackscholes.js
 *
 * This script defines a Black-Scholes option pricing object. This interface
 * is required by the Position Manager object.  
 *
**/

'use strict';

if (!oedge) {
    var oedge = {};
}

oedge.BlackScholes = function (obj) {
    // Make multiplier (i) negative if selling position. Makes quantity negative.
    var i = /Buy/.test(obj.f) ? 1 : -1;
    
    var vv;

    this.f = obj.f;
    this.q  = obj.q;
    this.qq = this.q * i * 100;
    this.pp = obj.pp;
    this.u = obj.u;
    this.x = obj.x;
    this.r = obj.r;
    this.t = obj.t;
    this.dr = (this.qq * this.pp);
    this.expDate = obj.expDate;
    this.numeric = Numeric;
    this.decPrice = 1000; // Defines how to round prices
    this.decDollar = 100; // Defines how to round profits

    // Check if option is a Call or Put
    if (/Call/.test(obj.f)) {
        this.getPrice = this.call;
    } else if (/Put/.test(obj.f)) {
        this.getPrice = this.put;
    }

    // Calculate implied volatility
    vv = this.impliedVol(this.pp, 0.000001, 100); // (pp, tol, nmax)
    if (vv) {
        this.vv = vv;
    } else {
        return {Error: 'Unable to find implied volatility.'};
    }
};

oedge.BlackScholes.prototype.getAttrObj = function () {
    return {
        f: this.f,
        q: this.q,
        qq: this.qq,
        pp: this.pp,
        u: this.u,
        x: this.x,
        r: this.r,
        t: this.t,
        dr: this.dr,
        vv: this.vv,
        expDate: this.expDate
    };
};

oedge.BlackScholes.prototype.getProfit = function (p) {
    return this.numeric.round((p - this.pp) * this.qq, this.decDollar);
};

oedge.BlackScholes.prototype.getDay = function () {
    return this.t;
};

oedge.BlackScholes.prototype.getDr = function () {
    return this.dr;
};

oedge.BlackScholes.prototype.getStrike = function () {
    return this.x;
};

// Bounds represent the expected price range of a position.
// Bounds are used by the application to determine what prices 
// should be displayed in tables and charts.
oedge.BlackScholes.prototype.getBounds = function () {
    var n = 1, // number of standard deviations
        u = this.u,
        v = this.vv,
        days = this.t,
        stddev1, stddevn, upper, lower;

    if (v > 3) {
        v = 3;
    }

    stddev1 = u * v * Math.sqrt(days / 252);
    stddevn = stddev1 * n;
    upper = this.numeric.round(u + stddevn, this.decDollar);
    lower = this.numeric.round(u - stddevn > 0 ? u - stddevn : 0, this.decDollar);
    return [lower, upper];
};

// Returns Black-Scholes price for call options.
oedge.BlackScholes.prototype.call = function (obj) {
    var x = this.x,
        r = this.r,
        u = obj.hasOwnProperty('u') ? obj.u : this.u,
        v = obj.hasOwnProperty('v') ? obj.v : this.vv,
        t, d1, d2;

    if (obj.hasOwnProperty('t')) {
        t = this.checkDay(obj.t);
    } else {
        t = this.checkDay(this.t);
    }

    d1 = this.d1f(u, x, r, t, v);
    d2 = this.d2f(d1, v, t);

    return this.numeric.round(u * this.numeric.cdf(d1, 0, 1) - x * 
        Math.pow(Math.E, -r * t) * this.numeric.cdf(d2, 0, 1), this.decPrice);
};

// Returns Black-Scholes price for put options.
oedge.BlackScholes.prototype.put = function (obj) {
    var x = this.x,
        r = this.r,
        u = obj.hasOwnProperty('u') ? obj.u : this.u,
        v = obj.hasOwnProperty('v') ? obj.v : this.vv,
        t, d1, d2;

    if (obj.hasOwnProperty('t')) {
        t = this.checkDay(obj.t);
    } else {
        t = this.checkDay(this.t);
    }

    d1 = this.d1f(u, x, r, t, v);
    d2 = this.d2f(d1, v, t);

    return this.numeric.round(x * Math.pow(Math.E, -r * t) * 
        this.numeric.cdf(-d2, 0, 1) - u * this.numeric.cdf(-d1, 0, 1), this.decPrice);
};

// Make sure days until expiration is never exactly zero.
oedge.BlackScholes.prototype.checkDay = function (t) {
    if (t > 0) {
        return t / 365;
    }
    if (t === 0) {
        return 0.00000000000001;
    }
    return 0;
};

oedge.BlackScholes.prototype.d1f = function (u, x, r, t, v) {
    return (Math.log(u / x) + (r + Math.pow(v, 2) / 2) * t) / (v * Math.sqrt(t));
};

oedge.BlackScholes.prototype.d2f = function (d1, v, t) {
    return d1 - v * Math.sqrt(t);
};

oedge.BlackScholes.prototype.impliedVol = function (pp, tol, nmax) {
    var highValue = 100,
        sigma_low = 0.000001,
        sigma_high = 0.3,
        bs, i, test, sigma;

    // Test for arbitrage    
    bs = this.getPrice({v: sigma_low});
    if (bs > pp) {
        //console.log(pp, bs, sigma_low);
        return undefined;
    }

    bs = this.getPrice({v: sigma_high});
    while (bs < pp) {
        sigma_high *= 2;
        bs = this.getPrice({v: sigma_high});
        if (sigma_high > highValue) {
            return undefined;
        }
    }

    for (i = 0; i < nmax; i++) {
        sigma = (sigma_low + sigma_high) / 2;
        bs = this.getPrice({v: sigma});
        test = bs - pp;
        if (Math.abs(test) < tol) {
            return sigma;
        }

        // If purchase price is greater than bs price,
        // then sigma is too low and should be in ,
        // upper half.
        if (test < 0) {
            sigma_low = sigma;
        } else {
            sigma_high = sigma;
        }
    }
};

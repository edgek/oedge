/**
 * position_mgr.js
 *
 * This script defines a Position Manager object. A Position Manager contains 
 * the option and stock positions a user has added. Positions should be interacted
 * with only through the Position Manager. For example, change an attribute of 
 * a position such as volatility via a function of the Position Manager. 
 * 
 * Positions added to the Position Manager should implement a common interface.     
 *
**/

'use strict';

if (!oedge) {
    var oedge = {};
}

oedge.PositionMgr = function () {
    this.positions = [];
};

oedge.PositionMgr.prototype.addPosition = function (p) {
    this.positions.push(p);
};

oedge.PositionMgr.prototype.changeVol = function (n) {
    var len = this.positions.length,
        i;

    for (i = 0; i < len; i++) {
        this.positions[i].changeVol(n);
    }
};

// Return all attributes of a position.
oedge.PositionMgr.prototype.getAttrObj = function () {
    var positions = this.positions,
        len = positions.length,
        arr = [],
        i;

    for (i = 0; i < len; i++) {
        arr.push(positions[i].getAttrObj());
    }

    return arr;
};

// Returns max upper and lower bounds of all positions.
// Each position has bounds based on things like volatility.
// Bounds represent the expected price range of a position.
// Bounds are used by the application to determine what prices 
// should be displayed in tables and charts. 
oedge.PositionMgr.prototype.getBounds = function () {
    var positions = this.positions,
        len = positions.length,
        lower, upper, i, boundsArr;

    boundsArr = positions[0].getBounds();
    lower = boundsArr[0];
    upper = boundsArr[1];

    for (i = 1; i < len; i++) {
        boundsArr = positions[i].getBounds();
        if (boundsArr[0] < lower) {
            lower = boundsArr[0];
        }
        if (boundsArr[1] > upper) {
            upper = boundsArr[1];
        }
    }
    return [lower, upper];
};

// Returns the maximum days until expiration to ensure all positions can be 
// explored. Each position could have a different expiration date.
oedge.PositionMgr.prototype.getMaxDay = function () {
    var positions = this.positions,
        len = positions.length,
        max = 0,
        i, d;

    for (i = 0; i < len; i++) {
        d = positions[i].getDay();
        if (d > max) {
            max = d;
        }
    }
    return max;
};

// Returns the sum of position cost. 
oedge.PositionMgr.prototype.getNetDr = function () {
    var positions = this.positions,
        len = positions.length,
        sum = 0,
        i;

    for (i = 0; i < len; i++) {
        sum += positions[i].getDr();
    }
    return sum;
};

oedge.PositionMgr.prototype.getNumberOfPositions = function () {
    return this.positions.length;
};

oedge.PositionMgr.prototype.getPosition = function (id) {
    return this.positions[id];
};

oedge.PositionMgr.prototype.getPositions = function () {
    return this.positions;
};

oedge.PositionMgr.prototype.replacePosition = function (id, position) {
    this.positions[id] = position;
};

// Returns theoretical prices for all open positions given a certain 
// underlying price and days remaining until expiration.
oedge.PositionMgr.prototype.getPrices = function (u, day) {
    var positions = this.positions,
        len = positions.length,
        prices = [],
        i;

    for (i = 0; i < len; i++) {
        prices.push(positions[i].getPrice({u: u, t: day}));
    }
    return prices;
};

// Returns theoretical profits for all open positions given a certain 
// theoretical price for each respective position. 
oedge.PositionMgr.prototype.getProfits = function (prices) {
    var positions = this.positions,
        len = positions.length,
        profits = [],
        i;

    for (i = 0; i < len; i++) {
        profits.push(positions[i].getProfit(prices[i]));
    }
    return profits;
};

// Returns a unique list of strike prices of open positions.
oedge.PositionMgr.prototype.getStrikes = function () {
    var positions = this.positions,
        len = positions.length,
        strikes = [],
        i, ps;

    for (i = 0; i < len; i++) {
        ps = positions[i].getStrike();

        // Add strike price only if it doesn't already exist in strikes array.
        strikes.indexOf(ps) === -1 && strikes.push(ps);
    }
    return strikes;
};

oedge.PositionMgr.prototype.getTotalProfit = function (u, day) {
    var positions = this.positions,
        poslen = positions.length,
        sum = 0,
        i, p, pr, pf;

    for (i = 0; i < poslen; i++) {
        p = positions[i];
        pr = p.getPrice({u: u, t: day});
        pf = p.getProfit(pr);
        sum += pf;
    }

    return sum;
};

oedge.PositionMgr.prototype.removePosition = function (obj) {
    this.removeObjFromArray(obj, this.positions);
};

oedge.PositionMgr.prototype.removeAllPositions = function () {
    this.positions = [];
};

oedge.PositionMgr.prototype.removePositionByID = function (id) {
    this.positions.splice(id, 1);
};

oedge.PositionMgr.prototype.removeObjFromArray = function (obj, arr) {
    var len = arr.length,
        i;

    for (i = 0; i < len; i++) {
        if (arr[i] === obj) {
            arr.splice(i, 1);
            break;
        }
    }
};


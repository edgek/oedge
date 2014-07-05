/**
 * data.js
 *
 * This script defines a Data object. Data keeps track of position price and
 * profitability data by underlying price and current days until expiration.  
 *
**/

'use strict';

if (!oedge) {
    var oedge = {};
}

oedge.Data = function (day, prices, pm) {
    this.pm = pm; // Position Manager
    this.day = day;
    this.prices = prices;
    this.data = {
        prices: [],
        pr: [],
        pf: [],
        tp: []
    };
    this.numeric = Numeric;
};

oedge.Data.prototype.clear = function () {
    this.data = {
        prices: [],
        pr: [],
        pf: [],
        tp: []
    };
};

oedge.Data.prototype.run = function () {
    var prices = this.data.prices = this.prices.getPrices(),
        pr = this.data.pr = [], // set local var and clear old arrays
        pf = this.data.pf = [], 
        tp = this.data.tp = [],
        day = this.day.value,
        plen = prices.length,
        sum = this.numeric.sum,
        pm = this.pm,
        prN, pfN, i;

    for (i = 0; i < plen; i++) {
        prN = pm.getPrices(prices[i], day);
        pfN = pm.getProfits(prN);
        pr.push(prN); // push array
        pf.push(pfN); // push array
        tp.push(sum(pfN)); // push float
    }
};

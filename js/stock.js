/**
 * stock.js
 *
 * This script defines a stock pricing object. This interface is required by 
 * the Position Manager object.  
 *
**/

'use strict';

if (!oedge) {
    var oedge = {};
}

oedge.Stock = function (obj) {
    // Make multiplier negative if selling position. Makes quantity negative.
    var i = /Buy/.test(obj.f) ? 1 : -1;

    this.f = obj.f;
    this.q  = obj.q;
    this.qq = this.q * i;
    this.pp = obj.pp;
    this.dr = (this.qq * this.pp);
};

oedge.Stock.prototype.getPrice = function (obj) {
    return obj.u;
};

oedge.Stock.prototype.getProfit = function (p) {
    return (p - this.pp) * this.qq;
};

// Bounds represent the expected price range of a position.
// Bounds are used by the application to determine what prices 
// should be displayed in tables and charts.
oedge.Stock.prototype.getBounds = function () {
    var pp = this.pp,
        i = pp * 0.20;

    return [pp - i, pp + i];
};

oedge.Stock.prototype.getDay = function () {
    return 0;
};

oedge.Stock.prototype.getDr = function () {
    return this.dr;
};

oedge.Stock.prototype.getStrike = function () {
    return undefined;
};

oedge.Stock.prototype.getVol = function () {};

oedge.Stock.prototype.setVol = function () {};

oedge.Stock.prototype.getU = function () {};

oedge.Stock.prototype.getAttrObj = function () {
    return {
        f: this.f,
        q: this.q,
        qq: this.qq,
        pp: this.pp,
        u: undefined,
        x: undefined,
        r: undefined,
        t: undefined,
        v: undefined,
        dr: this.dr,
        vv: undefined,
        expDate: undefined
    };
};

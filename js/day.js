/**
 * day.js
 *
 * This script defines a Day object. A Day keeps track of the number of days
 * until expiration. Or a Day can be zero, implying that it is the Day at 
 * expiration.     
 *
**/

'use strict';

if (!oedge) {
    var oedge = {};
}

oedge.Day = function () {
    // Max used to ensure the day never exceeds the maximum days until
    // expiration for a position.
    this.max = undefined;
    this.value = undefined;
};

oedge.Day.prototype.clear = function () {
    this.max = undefined;
    this.value = undefined;
};

oedge.Day.prototype.init = function (n) {
    this.max = n;
    this.value = n;
};

oedge.Day.prototype.setDay = function (n) {
    if (typeof n === 'number' && n >= 0 && n <= this.max) {
        this.value = n;
        return true;
    }
    return false;
};

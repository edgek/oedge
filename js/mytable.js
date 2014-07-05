/**
 * mytable.js
 *
 * This script defines a MyTable object. A MyTable contains html for a table
 * that contains profitability information for a strategy.      
 *
**/

'use strict';

if (!oedge) {
    var oedge = {};
}

oedge.MyTable = function (dc, de) {
    this.dc = dc; // Data at current days until expiration
    this.de = de; // Data at expiration
    this.str = undefined; // The html string generated
    this.fixedPrice = 3; // The number of decimal places for price values
    this.fixedDollar = 2; // The number of decimal places for profit dollars
};

oedge.MyTable.prototype.run = function () {
    var cur = this.dc.data,
        exp = this.de.data,
        fixedPrice = this.fixedPrice,
        fixedDollar = this.fixedDollar,
        str, posLen, priceLen, i, j;

    // make header row
    str = '<table class="oedge-table"><thead class="oedge-thead"><tr><th>Price</th>';
    posLen = cur.pr[0].length;
    for (i = 0; i < posLen; i++) {
        str += "<th colspan='2'>Position #" + (i + 1) + '</th>';
    }
    str += '<th>Current</th><th>Expiration</th></tr></thead><tbody class="oedge-tbody">';

    // make data rows
    priceLen = cur.prices.length;
    for (i = 0; i < priceLen; i++) {
        str += "<tr><td class='oedge-bg-color oedge-border-r-solid'>" +
            cur.prices[i].toFixed(fixedDollar) + '</td>';

        for (j = 0; j < posLen; j++) {
            str += "<td class='oedge-border-r-dashed'>" +
                cur.pr[i][j].toFixed(fixedPrice) + '</td>';
            str += "<td class='oedge-border-r-solid'>" +
                cur.pf[i][j].toFixed(fixedDollar).replace(/^(-)?(\d+\.\d+)/, '$1$$$2') + '</td>';
        } // end inner for

        str += "<td class='oedge-bg-color oedge-border-r-solid'>" +
            cur.tp[i].toFixed(fixedDollar).replace(/^(-)?(\d+\.\d+)/, '$1$$$2') + '</td>';
        str += "<td class='oedge-bg-color'>" +
            exp.tp[i].toFixed(fixedDollar).replace(/^(-)?(\d+\.\d+)/, '$1$$$2') + '</td></tr>';

    } // end outer for

    this.str = str + '</tbody></table>';
};

oedge.MyTable.prototype.draw = function (id) {
    $(id).html(this.str);
};


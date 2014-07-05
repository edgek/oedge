/**
 * mydygraph.js
 *
 * This script defines a MyDygraph object. MyDygraph implments the Dygraph 
 * charting package to chart profitability information for a strategy.     
 *
 * Dependency is dygraphs.com.
 * 
**/

'use strict';

if (!oedge) {
    var oedge = {};
}

oedge.MyDygraph = function (dc, de) {
    this.dc = dc;
    this.de = de;
    this.data = [];
};

oedge.MyDygraph.prototype.run = function () {
    var data = this.data = [],  // jslint does not like this
        cur = this.dc.data,
        exp = this.de.data,
        plen,
        i;

    plen = cur.prices.length;

    for (i = 0; i < plen; i++) {
        data.push([cur.prices[i], cur.tp[i], exp.tp[i]]);
    }
};

oedge.MyDygraph.prototype.draw = function (id) {
    new Dygraph(
        $(id)[0], // containing div
        this.data,
        {
            //ylabel: 'P/L',
            //xlabel: 'Price',
            interactionModel: {},
            showRangeSelector: false,
            rangeSelectorHeight: 30,
            panEdgeFraction: 0,
            xLabelHeight: '11',
            yAxisLabelWidth: 50,
            axisLineWidth: 1,
            axisLabelFontSize: 16,
            axisLineColor: 'gray',
            gridLineColor: '#dddddd',
            gridLineWidth: 1,
            strokeWidth: 0.5,
            drawAxesAtZero: true,
            includeZero: false,
            labelsSeparateLines: true,
            //labelsDivWidth: 200,
            axes: {
                y: {
                    valueFormatter: function (v) {
                        return v.toFixed(2).replace(/^(-)?(\d+\.\d+)/, '$1$$$2');
                    },
                    axisLabelFormatter: function (v) {
                        return v.toFixed(0).replace(/^(-)?(\d+\.*\d+)/, '$1$$$2');
                    }
                },
                x: {
                    valueFormatter: function (v) {
                        return v.toFixed(2);
                    }
                }

            },
            series : {
                'P/L Current': {
                    strokePattern: Dygraph.DASHED_LINE,
                    strokeWidth: 1,
                    drawPoints: false,
                    pointSize: 1.5
                },
                'P/L Expiration': {
                    strokeWidth: 1,
                    drawPoints: false,
                    pointSize: 1.5
                }
            },
            labels: ["Price", "P/L Current", "P/L Expiration"]
        }
    );
};

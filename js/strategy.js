/**
 * strategy.js
 *
 * This script defines a Strategy object. A Strategy is the only object the 
 * user interface interacts with directly. It is composed of other objects
 * that collectively make it an option trading strategy. For exampple, a
 * Strategy contains a position manager that contains the option or stock 
 * positions a user has added.   
 *
**/

'use strict';

if (!oedge) {
    var oedge = {};
}

oedge.Strategy = function (obj) {
    this.pm = new oedge.PositionMgr();
    this.day = new oedge.Day();
    this.dayExp = new oedge.Day();
    this.prices = new oedge.Prices();
    this.dc = new oedge.Data(this.day, this.prices, this.pm);
    this.de = new oedge.Data(this.dayExp, this.prices, this.pm);
    this.chart = new oedge.MyDygraph(this.dc, this.de);
    this.grid = new oedge.MyTable(this.dc, this.de);

    // IDs of HTML elements and functions that change them    
    this.env = {
        positions_div: obj.positions_div,
        grid_div: obj.grid_div,
        chart_div: obj.chart_div,
        positions_dialog_div: obj.positions_dialog_div,
        delete_dialog_div: obj.delete_dialog_div,
        showFn: obj.showFn,
        hideFn: obj.hideFn,
        tipFn: obj.tipFn,
        drawFn: obj.drawFn,
        fields: obj.fields
    };

    this.defaultNobs = 12; // Number of rows displayed on data table
    this.numeric = Numeric;
    this.maxDay = undefined; // A helper to widgets
};

// Runs when a position is added or removed.
oedge.Strategy.prototype.init = function () {
    var bounds = this.pm.getBounds(),
        maxDay = this.pm.getMaxDay(),
        strikes = this.pm.getStrikes();

    this.maxDay = maxDay;
    this.day.init(maxDay);
    this.dayExp.init(0);
    this.prices.init(bounds[0], bounds[1], this.defaultNobs, strikes);
};

// Runs when removing a position leaves zero positions.
oedge.Strategy.prototype.emptyDivs = function () {
    //$(this.env.positions_div).empty();
    $(this.env.grid_div).empty();
    $(this.env.chart_div).empty();
    $(this.env.positions_div).empty();
};

// Returns current and maximum days until expiration.
oedge.Strategy.prototype.getDay = function () {
    return {
        day: this.day.value,
        maxDay: this.pm.getMaxDay()
    };
};

// Returns current price range and current days until expiration.
oedge.Strategy.prototype.getValues = function () {
    var priceRange = this.prices.getPricesRange(),
        day = this.getDay();

    return {priceRange: priceRange, day: day};
};

// Returns a black-scholes option position object or stock position object.
oedge.Strategy.prototype.makePosition = function (obj) {
    var makeTodayDate = this.numeric.makeTodayDate,
        dateDiff = this.numeric.dateDiff,
        position, dateToday, dateT, diff;

    dateToday = makeTodayDate();
    dateT = new Date(obj.t.value);
    diff = dateDiff(dateT, dateToday); // Days until expiration

    if (/Call|Put/.test(obj.f.value)) {
        position = new oedge.BlackScholes({
            f: obj.f.value,
            pp: obj.pp.value,
            q: obj.q.value,
            u: obj.u.value,
            x: obj.x.value,
            r: obj.r.value,
            t: diff,
            expDate: obj.t.value
        });
    } else if (/Stock/.test(obj.f.value)) {
        position = new oedge.Stock({f: obj.f.value, pp: obj.pp.value, q: obj.q.value});
    }

    return position;
};

// Runs when a position changes or is deleted.
oedge.Strategy.prototype.refreshPositionDiv = function () {
    var positions = this.pm.getPositions(),
        addDollarSign = this.numeric.addDollarSign,
        formatPercent = this.numeric.formatPercent,
        that = this,
        i, attrObj, $tr;

    // Create positions table header
    $(this.env.positions_div).html(
        '<table class="oedge-table">' +
            '<thead class="oedge-thead">' +
                '<tr>' +
                    '<th>#</th>' +
                    '<th>Type</th>' +
                    '<th>Qty</th>' +
                    '<th>Price</th>' +
                    '<th>Expire</th>' +
                    '<th>Strike</th>' +
                    '<th>Debit</th>' +
                    '<th>Imp Vol</th>' +
                '</tr>' +
            '</thead>' +
            '<tbody class="oedge-tbody"></tbody>' +
        '</table>'
    );

    // Populate positions table body
    for (i = 0; i < positions.length; i++) {
        attrObj = positions[i].getAttrObj();

        $tr = $('<tr>').html(
            "<td class='oedge-bg-color'>" + (i + 1) + '</td>' +
            '<td>' + attrObj.f + '</td>' +
            '<td>' + attrObj.q + '</td>' +
            '<td>' + attrObj.pp + '</td>' +
            '<td>' + (attrObj.expDate || '--') + '</td>' +
            '<td>' + (attrObj.x || '--') + '</td>' +
            "<td class='oedge-bg-color'>" + addDollarSign(attrObj.dr.toFixed(2)) + '</td>' +
            "<td class='oedge-bg-color'>" + formatPercent(attrObj.vv) + '</td>' +
            "<td class='oedge-bg-color'>" +
                "<a href='#' title='Edit Position'" +
                    "style='display: inline-block;' class='ui-icon ui-icon-pencil'></a>" +
                "<a href='#' title='Delete Position'" +
                    "style='display: inline-block;' class='ui-icon ui-icon-trash'></a>" +
            '</td>'

        );

        // Make click event for delete position icon
        $tr.find('.ui-icon.ui-icon-trash').on('click', function () {
            // Find position ID from first cell of row
            var id = Number($(this).parents('tr').find(">:first-child").text());
            that.openDialogDeletePos(event, id);
        });

        // Make click event for edit position icon.
        // Event populates text boxes with current values for the position 
        // selected and then opens a dialog so they can be edited.
        $tr.find('.ui-icon.ui-icon-pencil').on('click', function (event) {
            // Find position ID from first cell of row
            var id = Number($(this).parents('tr').find(">:first-child").text()),
                position = that.pm.getPosition(id - 1),
                attrObj = position.getAttrObj();

            $(that.env.fields.f).val(attrObj.f);
            $(that.env.fields.pp).val(attrObj.pp);
            $(that.env.fields.q).val(attrObj.q);
            $(that.env.fields.x).val(attrObj.x);
            $(that.env.fields.u).val(attrObj.u);
            $(that.env.fields.t).val(attrObj.expDate);
            $(that.env.fields.r).val(attrObj.r);

            that.openDialogEditPos(event, id);
        });

        $(this.env.positions_div + ' tbody').append($tr);
    }

    // Ensures at least 2 rows are present in the positions table.
    for ( ; i < 2; i++) {
        $tr = $('<tr>').html(
            "<td class='oedge-bg-color'></td>" +
            '<td></td>' +
            '<td></td>' +
            '<td></td>' +
            '<td></td>' +
            '<td></td>' +
            "<td class='oedge-bg-color'></td>" +
            "<td class='oedge-bg-color'></td>" +
            "<td class='oedge-bg-color'></td>"
        );

        $(this.env.positions_div + ' tbody').append($tr);
    }

    this.env.showFn();
};

// Generate data and populate widgets based on that data.
oedge.Strategy.prototype.draw = function (scope) {
    // Data shouldn't run if only day changes, so use 'full'
    scope === 'full' && this.de.run();
    
    // These should always run
    this.dc.run();
    this.grid.run();
    this.chart.run();
    this.grid.draw(this.env.grid_div);
    this.chart.draw(this.env.chart_div);
    this.env.drawFn(this.getValues());
};

/*
oedge.Strategy.prototype.addPosition = function (fields) {
    var position = this.makePosition(fields);

    // Check for sucessful return code
    if (position.hasOwnProperty('Error')) {
        this.env.tipFn('Position not added. ' + position.Error)
        return;
    }

    this.pm.addPosition(position);
    this.init();
    this.refreshPositionDiv();
    this.draw('full');
};
*/

oedge.Strategy.prototype.removePosition = function (id) {
    this.pm.removePositionByID(id - 1);
    
    if (this.pm.getNumberOfPositions() > 0) {
        this.init();
        this.refreshPositionDiv();
        this.draw('full');
    } else {
        this.day.clear();
        this.dayExp.clear();
        this.prices.clear();
        this.dc.clear();
        this.de.clear();

        this.emptyDivs();
        this.env.hideFn();
    }
};

// Runs when user changes price range.
oedge.Strategy.prototype.setPrices = function (lower, upper, nobs) {
    if (this.prices.setPrices(lower, upper, nobs, this.pm.getStrikes())) {
        this.draw('full');
    }
};

// Runs when user changes days until expiration.
oedge.Strategy.prototype.setDay = function (n) {
    if (this.day.setDay(n)) {
        this.draw();
        return true;
    } else {
        return false;
    }
};

oedge.Strategy.prototype.openDialogAddPos = function (event, fn) {
    var that = this;

    $(that.env.positions_dialog_div).dialog({
        title: 'Add Position',
        autoOpen: false,
        height: 350,
        width: 300,
        modal: false,
        buttons: {
            Add: function() {
                var fields = that.processFields(),
                    position;

                if (fields) {
                    position = that.makePosition(fields);

                    // Check for sucessful return code
                    if (position.hasOwnProperty('Error')) {
                        that.env.tipFn('Position not added. ' + position.Error)
                    } else {
                        $(this).dialog('close');
                        that.pm.addPosition(position);
                        that.init();
                        that.refreshPositionDiv();
                        that.draw('full');
                    }
                }
            },
            Cancel: function() {
                $(this).dialog('close');
            }
        }
    });

    $(that.env.positions_dialog_div).dialog('open')
        .dialog('option', 'position',[event.clientX,event.clientY]);
};

oedge.Strategy.prototype.openDialogEditPos = function (event, id) {
    var that = this;

    $(that.env.positions_dialog_div).dialog({
        autoOpen: false,
        height: 350,
        width: 300,
        modal: false,
        buttons: {
            Save: function() {
                var fields = that.processFields(),
                    position;

                if (fields) {
                    position = that.makePosition(fields);

                    // Check for sucessful return code
                    if (position.hasOwnProperty('Error')) {
                        this.env.tipFn('Position not added. ' + position.Error)
                    } else {
                        $(this).dialog('close');
                        that.pm.replacePosition(id - 1, position);
                        that.init();
                        that.refreshPositionDiv();
                        that.draw('full');
                    }
                }
            },
            Cancel: function() {
                $(this).dialog('close');
            }
        }
    });

    $(that.env.positions_dialog_div).dialog('option', 'title', 'Edit Position #' + id);
    $(that.env.positions_dialog_div).dialog('open')
        .dialog('option', 'position',[event.clientX,event.clientY]);
};

oedge.Strategy.prototype.openDialogDeletePos = function (event, id) {
    var that = this;

    $(that.env.delete_dialog_div).dialog({
        autoOpen: false,
        height: 50,
        width: 200,
        modal: false,
        buttons: {
            Yes: function() {
                that.removePosition(id);
                $(this).dialog('close');
            },
            No: function() {
                $(this).dialog('close');
            }
        }
    });

    $(that.env.delete_dialog_div).dialog('option', 'title', 'Delete Position #' + id +'?');
    $(that.env.delete_dialog_div).dialog('open')
        .dialog('option', 'position',[event.clientX,event.clientY]);
};

oedge.Strategy.prototype.openDialogDeleteAllPos = function (event) {
    var that = this;

    if (this.pm.getNumberOfPositions() === 0) {
        return;
    }

    $(that.env.delete_dialog_div).dialog({
        autoOpen: false,
        height: 50,
        width: 200,
        modal: false,
        buttons: {
            Yes: function() {
                that.pm.removeAllPositions();

                that.day.clear();
                that.dayExp.clear();
                that.prices.clear();
                that.dc.clear();
                that.de.clear();

                that.emptyDivs();
                that.env.hideFn();
                $(this).dialog('close');
            },
            No: function() {
                $(this).dialog('close');
            }
        }
    });

    $(that.env.delete_dialog_div).dialog('option', 'title', 'Delete all positions?');
    $(that.env.delete_dialog_div).dialog('open')
        .dialog('option', 'position',[event.clientX,event.clientY]);
};

// Validates fields entered in dialog and returns fields object.
oedge.Strategy.prototype.processFields = function () {
    var isValid = true,
        numeric = this.numeric,
        p, pty, fields, addTip;

    addTip = function (s) {
        $('#tooltip').append('<p>' + s + '</p>');
    };

    fields = {
        f: {id: this.env.fields.f,
            value: $(this.env.fields.f).val(),
            tip: 'Type field requires a valid string',
            class: 'ui-state-error'
        },
        pp: {id: this.env.fields.pp,
            value: numeric.convFloat($(this.env.fields.pp).val()),
            tip: 'Price field requires a valid number',
            class: 'ui-state-error'
        },
        q: {id: this.env.fields.q,
            value: numeric.convInt($(this.env.fields.q).val()),
            tip: 'Quantity field requires a valid number',
            class: 'ui-state-error'
        },
        x: {id: this.env.fields.x,
            value: numeric.convFloat($(this.env.fields.x).val()),
            tip: 'Strike field requires a valid number',
            class: 'ui-state-error'
        },
        u: {id: this.env.fields.u,
            value: numeric.convFloat($(this.env.fields.u).val()),
            tip: 'Underlying field requires a valid number',
            class: 'ui-state-error'
        },
        t: {id: this.env.fields.t,
            value: numeric.getConvDate($(this.env.fields.t).val()),
            tip: 'Exp Date field requires a valid date in mm/dd/yyyy',
            class: 'ui-state-error'
        },
        r: {id: this.env.fields.r,
            value: numeric.convPct($(this.env.fields.r).val()),
            tip: 'Risk Free Rate field requires a valid number',
            class: 'ui-state-error'
        }
    };

    $('form div').children().removeClass('ui-state-error');
    $('#tooltip').empty();

    for (p in fields) {
        if (fields.hasOwnProperty(p)) {
            pty = fields[p];
            if (!$(pty.id).prop('disabled')) {
                if (pty.value === undefined) {
                    addTip(pty.tip);
                    $(pty.id).addClass(pty.class);
                    isValid = false;
                }
            }
        }
    }

    if (isValid) {
        return fields;
    } else {
        return false;
    }
};

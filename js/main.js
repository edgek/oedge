/**
 * onload.js
 *
 * This script defines the actions to be performed when the
 * application first loads.
 *
**/

'use strict';

var test; // A global Strategy object used to ease testing.

$(document).ready(function () {
    var numeric = Numeric,
        round = numeric.round,
        addTip, getFields, drawWidgets, hideAll, showAll, addTip, s;

    // A function to run when there are no positions
    hideAll = function () {
        //$('#position-tbl-div').hide();
        $('.spinners').spinner('option', 'disabled', true);
        $('.sliders').slider('option', 'disabled', true);
        $('#tabs-ctrl').tabs('disable');
    };

    // A function to run when there are positions > 0
    showAll = function () {
        $('#position-tbl-div').show();
        $('.spinners').spinner('option', 'disabled', false);
        $('.sliders').slider('option', 'disabled', false);
        $('#tabs-ctrl').tabs('option', 'disabled', false);
    };

    // A function to run when input values are incorrect.
    addTip = function (s) {
        $('#tooltip').append('<p>' + s + '</p>');
    };

    drawWidgets = function (v) {
        $('#slider-prices').slider('option', 'max', v.priceRange.max);
        $('#slider-day').slider('option', 'max', v.day.maxDay);
        $('#spinner-day').spinner('option', 'max', v.day.maxDay);
        $('#slider-prices').slider('option', 'values', [v.priceRange.lower, v.priceRange.upper]);
        $('#spinner-obs').spinner('value', v.priceRange.nobs);
        $('#spinner-start').spinner('value', v.priceRange.lower);
        $('#spinner-end').spinner('value', v.priceRange.upper);
        $('#spinner-day').spinner('value', v.day.day);
        $('#slider-day').slider('option', 'value', v.day.maxDay - v.day.day);
    };

    // Create a new strategy
    s = new oedge.Strategy({
        positions_div: '#position-tbl-div',
        grid_div: '#grid-tbl-div',
        chart_div: '#chart-div',
        positions_dialog_div: '#position-dialog-div',
        delete_dialog_div: '#delete-dialog-div',
        showFn: showAll,
        hideFn: hideAll,
        tipFn: addTip,
        drawFn: drawWidgets,
        fields: {f: '#f', pp: '#pp', q: '#q', x: '#x', u: '#u', t: '#t', r: '#r'}
    });

    // Set strategy to global variable for testing
    test = s;

    $('#position-dialog-div').dialog({
        autoOpen: false,
        height: 325,
        width: 300,
        modal: false
    });

    $('#delete-dialog-div').dialog({
        autoOpen: false,
        height: 325,
        width: 300,
        modal: false
    });

    $("#tabs-pos").tabs();

    $("#tabs-ctrl").tabs();

    $('#tabs-ctrl').tabs('disable');

    $('#add-position').click(function (event) {
        s.openDialogAddPos(event);
    });

    $('#remove-all-positions').click(function (event) {
        s.openDialogDeleteAllPos(event);
    });

    $('#t').datepicker({
        numberOfMonths: 1,
        showButtonPanel: true,
        changeMonth: true,
        changeYear: true
    });

    $('#slider-day').slider({
        disabled: true,
        range: 'max',
        value: 0,
        min: 0,
        step: 1,
        slide: function (event, ui) {
            s.setDay(s.maxDay - ui.value); // ui starts at zero
            drawWidgets(s.getValues());
        }
    });

    $("#spinner-day").spinner({
        disabled: true,
        min: 0,
        step: 1,
        spin: function (event, ui) {
            s.setDay(ui.value);
            drawWidgets(s.getValues());
        }
    });

    $("#spinner-day").on('change', function () {
        // Add on keypress-enter event for IE

        var val = $(this).val();

        if (numeric.testInt(val)) {
            s.setDay(round(Number(val), 1));
        }

        drawWidgets(s.getValues());
    });

    $('#slider-prices').slider({
        disabled: true,
        range: true,
        min: 0,
        step: 0.01,
        slide: function (event, ui) {
            s.setPrices(
                ui.values[0],
                ui.values[1],
                $("#spinner-obs").spinner("value")
            );
            drawWidgets(s.getValues());
        }
    });

    $("#spinner-obs").spinner({
        disabled: true,
        min: 1,
        step: 1,
        spin: function (event, ui) {
            s.setPrices(
                $("#spinner-start").spinner("value"),
                $("#spinner-end").spinner("value"),
                ui.value
            );
            drawWidgets(s.getValues());
        }
    });

    $("#spinner-start").spinner({
        disabled: true,
        min: 0,
        step: 0.01,
        spin: function (event, ui) {
            s.setPrices(
                ui.value,
                $("#spinner-end").spinner("value"),
                $("#spinner-obs").spinner("value")
            );
            drawWidgets(s.getValues());
        }
    });

    $("#spinner-end").spinner({
        disabled: true,
        min: 0,
        step: 0.01,
        spin: function (event, ui) {
            s.setPrices(
                $("#spinner-start").spinner("value"),
                ui.value,
                $("#spinner-obs").spinner("value")
            );
            drawWidgets(s.getValues());
        }
    });

    $("#spinner-obs").on('change', function () {
        var val = $(this).val();

        if (numeric.testInt(val)) {
            s.setPrices(
                $("#spinner-start").spinner("value"),
                $("#spinner-end").spinner("value"),
                round(Number(val), 1)
            );
        }
        drawWidgets(s.getValues());
    });

    $("#spinner-start").on('change', function () {
        var val = $(this).val();

        if (numeric.testFloat(val)) {
            s.setPrices(
                round(Number(val), 100),
                $("#spinner-end").spinner("value"),
                $("#spinner-obs").spinner("value")
            );
        }
        drawWidgets(s.getValues());
    });

    $("#spinner-end").on('change', function () {
        var val = $(this).val();

        if (numeric.testFloat(val)) {
            s.setPrices(
                $("#spinner-start").spinner("value"),
                round(Number(val), 100),
                $("#spinner-obs").spinner("value")
            );
        }
        drawWidgets(s.getValues());
    });
});



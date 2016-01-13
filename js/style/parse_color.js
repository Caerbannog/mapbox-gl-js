'use strict';

var parseCSSColor = require('csscolorparser').parseCSSColor;
var util = require('../util/util');

var colorCache = {};

function parseColor(input) {

    if (colorCache[input]) {
        return colorCache[input];

    // RGBA array
    } else if (Array.isArray(input)) {
        return input;

    // style function
    } else if (input && input.range) {
        return util.extend({}, input, {
            range: input.range.map(parseColor)
        });

    // legacy style function
    } else if (input && input.stops) {
        return util.extend({}, input, {
            stops: input.stops.map(function(step) {
                return [step[0], parseColor(step[1])];
            })
        });

    // Color string
    } else if (typeof input === 'string') {
        var output = colorDowngrade(parseCSSColor(input));
        colorCache[input] = output;
        return output;

    } else {
        throw new Error('Invalid color ' + input);
    }

}

function colorDowngrade(color) {
    return [color[0] / 255, color[1] / 255, color[2] / 255, color[3]];
}

module.exports = parseColor;

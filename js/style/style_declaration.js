'use strict';

var StyleFunction = require('./style_function');
var parseColor = require('./parse_color');

module.exports = StyleDeclaration;

function StyleDeclaration(reference, value) {
    this.type = reference.type;
    this.transitionable = reference.transition;

    if (value == null) {
        value = reference.default;
    }

    // immutable representation of value. used for comparison
    this.json = JSON.stringify(value);

    if (this.type === 'color') {
        this.value = parseColor(value);
    } else {
        this.value = value;
    }

    this.calculate = StyleFunction.createBackwardsCompatible(reference, this.value);

    if (reference.function !== 'interpolated' && reference.transition) {
        this.calculate = transitioned(this.calculate);
    }
}

function transitioned(calculate) {
    return function(z, zh, duration) {
        var fraction = z % 1;
        var t = Math.min((Date.now() - zh.lastIntegerZoomTime) / duration, 1);
        var fromScale = 1;
        var toScale = 1;
        var mix, from, to;

        if (z > zh.lastIntegerZoom) {
            mix = fraction + (1 - fraction) * t;
            fromScale *= 2;
            from = calculate(z - 1);
            to = calculate(z);
        } else {
            mix = 1 - (1 - t) * fraction;
            to = calculate(z);
            from = calculate(z + 1);
            fromScale /= 2;
        }

        return {
            from: from,
            fromScale: fromScale,
            to: to,
            toScale: toScale,
            t: mix
        };
    };
}

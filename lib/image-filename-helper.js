//
// image-filename-helper.js
//
// Copyright (C) 2013 Hector Guillermo Parra Alvarez (@hgparra)
// Released under The MIT License (MIT) - http://opensource.org/licenses/MIT
//

var path = require("path");

// e.g. noodle.jpg
// $1 = name
// $2 = extension
var LEGAL_FILENAME_REGEX = /^(.+)\.(png|jpg|jpeg|gif)$/i;

// e.g. noodle@2x^640w,1x.jpg
// $1 = name
// $2 = @media rule if it exists else undefined
// $3 = extension
var LEGAL_FILENAME_WITH_RULE_REGEX = /^([^\@]+)(?:\@?)([0-9hwx\,\.\+]{2,})?\.(png|jpg|jpeg|gif)$/i;

// e.g. 640w
// $1 = number (integer or float)
// $2 = unit
var LEGAL_MEDIA_EXPRESSION_REGEX = /^([0-9\.]+)(x|w|h|mw|mh)$/i;

// weights for comparing query values
var DENSITY_WEIGHT = 10,            // value occupies last 2 digits
    WIDTH_WEIGHT = 100000,          // value occupies middle 4 digits
    HEIGHT_WEIGHT = 1000000000;     // value occupies first 4 digits

var ImageFilenameHelper = {

    // accepts an image filepath
    // returns an image file metadata object
    // throws Error
    parseFilename: function (filepath) {

        if (!this.isImageFilename(filepath)) {
            throw new Error();
        }

        var results = LEGAL_FILENAME_WITH_RULE_REGEX.exec(path.basename(filepath)),
            queries = results[2];

        if (typeof queries === "undefined") {
            queries = [];
        }
        else {
            queries = queries.split(',');
        }

        return {
            classname: results[1],   // filename before micro media rule
            queries: queries,        // media query strings
            extname: results[3]      // file extension
        }
    },

    // accepts @media rule micro DSL string
    // returns CSS media query objects array
    // throws Error
    parseMediaQueries: function (rule) {

        // empty string is legal
        // return rule with empty queries
        if (rule === "") { 
            return [];
        }

        // check for sane string
        if (!/^[0-9hwx\,\.\+]*$/i.test(rule)) {
            throw new Error("Illegal @media rule");
        }

        // split queries, e.g. "2x^640w,1x" -> ["2x^640w", "1x"] then
        // split exps, e.g. "2x^640w" -> ["2x", "640w"]
        var queries = rule.split(',');
        for (var i = 0; i < queries.length; i++) {
            var exps = queries[i].split('+');
            for (var j = 0; j < exps.length; j++) {
                exps[j] = this.parseMediaDescriptorAsExpressionObject(exps[j]);
            };
            queries[i] = exps;
        };

        return queries;
    },

    // accepts a media descriptor string
    // returns CSS media expression object
    // throws Error
    parseMediaDescriptorAsExpressionObject: function (descriptor) {
        if (!LEGAL_MEDIA_EXPRESSION_REGEX.test(descriptor)) {
            throw new Error("Illegal media query descriptor: " + descriptor);
        }

        var exp = LEGAL_MEDIA_EXPRESSION_REGEX.exec(descriptor),
            feature,
            value;

        switch (exp[2]) {
        case 'x':
            feature = "max-device-pixel-ratio";
            break;
        case 'w':
            feature = "max-width";
            break;
        case 'h':
            feature = "max-height";
            break;
        default:
            throw new Error("Illegal media query descriptor");
        }

        value = parseFloat(exp[1]);
        if (exp[2] !== 'x') {
            value += "px";
        }

        return {
            feature: feature,
            value: value
        }
    },

    // accepts a media descriptor string
    // returns CSS media expression string
    // throws Error
    parseMediaDescriptorAsExpression: function (descriptor) {
        if (typeof descriptor === "undefined" || descriptor === null || descriptor === "") {
            return null;
        }

        var expObj = this.parseMediaDescriptorAsExpressionObject(descriptor);
        return "(" + expObj.feature + ": " + expObj.value + ")";
    },

    // accepts a media query string
    // returns array of CSS @media expressions
    parseMediaQueryAsExpressions: function (query) {
        if (typeof query === "undefined" || query === null || query === "") {
            return [];
        }

        var exps = query.split('+');
        for (var i = 0; i < exps.length; i++) {
            exps[i] = this.parseMediaDescriptorAsExpression(exps[i]);
        };
        return exps;
    },

    // accepts a media query string
    // returns query string with specified media descriptors with feature removed
    // e.g. f("1x^640w", 'x') => "640w"
    removeMediaDescriptorByFeature: function (query, feature) {
        // TODO: check if feature is valid?

        // can this be improved?
        var regex = new RegExp("\\+[0-9\\.]+" + feature
                                + "|[0-9\\.]+" + feature + "\\+?");
        return query.replace(regex, "");
    },

    // accepts media queries, a & b
    // returns number < 0 if a should have priority
    // returns number > 0 if b should have priority
    // reutrns number == 0 if a and b are equal
    compareMediaQueries: function (a, b) {
        if (a === b) {
            return 0;
        } else {
            return this.calculateMediaQueryWeight(a) - this.calculateMediaQueryWeight(b);
        }
    },

    // accepts a micro media query string
    // returns its weight
    // used for sorting
    calculateMediaQueryWeight: function (query) {
        var ratioValue = parseFloat(this.getRatio(query) * DENSITY_WEIGHT),
            queryWidth = this.getWidth(query),
            widthValue,
            heightValue = parseInt(this.getHeight(query) * HEIGHT_WEIGHT);

        // we want to sort widths in descending order
        // but if there is no width it should go *first*
        if (queryWidth) {
            widthValue = WIDTH_WEIGHT - queryWidth * 100; // aligns width weight e.g. 640px = 64000
        } else {
            widthValue = 0;
        }

        return ratioValue + widthValue + heightValue; 
    },

    // DEPRECATED
    // returns media rule substring if image filename contains one
    getMediaRule: function (filename) {
        return LEGAL_FILENAME_WITH_RULE_REGEX.exec(filename)[2] || null;
    },

    // returns media queries strings as array from filename
    getMediaQueries: function (filepath) {
        return this.parseFilename(filepath).queries;
    },

    // accepts image file path
    // returns the basename without @media rule or ext
    // e.g. `/path/to/noodle@1x.png` returns `noodle`
    getClassname: function (filepath) {
        return this.parseFilename(filepath).classname;
    },

    // checks if string is a legal image filename
    isImageFilename: function (filename) {
        return LEGAL_FILENAME_REGEX.test(filename);
    },

    // accepts micro query string
    // returns image ratio descriptor as float
    getRatio: function (str) {
        var matches = str.match(/([0-9\.]{1,3})x/);
        if (matches) {
            return parseFloat(matches[1]);
        }
        else {
            return null;
        }
    },

    // accepts micro query string
    // returns width descriptor as integer
    getWidth: function (str) {
        var matches = str.match(/([0-9]+)w/);
        if (matches) {
            return parseInt(matches[1]);
        }
        else {
            return null;
        }
    },

    // accepts micro query string
    // returns height descriptor as integer
    getHeight: function (str) {
        var matches = str.match(/([0-9]+)h/);
        if (matches) {
            return parseInt(matches[1]);
        }
        else {
            return null;
        }
    },

    //
    // Methods below possibly deprecated
    //

    // checks if filename has an image extension
    isImage: function (filename) {
        return /\.(png|jpg|jpeg|gif)$/i.test(filename);
    },

    // DEPRECATED
    // checks if filename has `-small` descriptor
    isSmallImage: function (filename) {
        return /-small\@/.test(filename);
    },

    // DEPRECATED
    // checks if filename does not have `-small` descriptor
    isNotSmallImage: function (filename) {
        return !ImageFilenameHelper.isSmallImage(filename);
    },

    // checks if filename has `@1x` descriptor
    is1xImage: function (filename) {
        return /\@.*1x/.test(filename);
    },

    // checks if filename has `@2x` descriptor
    is2xImage: function (filename) {
        return /\@.*2x/.test(filename);
    }
}

// export ImageFilenameHelper
for (i in ImageFilenameHelper) {
    exports[i] = ImageFilenameHelper[i];
}

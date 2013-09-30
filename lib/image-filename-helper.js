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
var LEGAL_FILENAME_WITH_RULE_REGEX = /^([^\@]+)(?:\@?)([0-9hwx\,\.\^]{2,})?\.(png|jpg|jpeg|gif)$/i;

// e.g. 640w
// $1 = number (integer or float)
// $2 = unit
var LEGAL_MEDIA_EXPRESSION_REGEX = /^([0-9\.]+)(x|w|h|mw|mh)$/i;

var ImageFilenameHelper = {

    // accepts an image filename
    // returns an image file metadata object
    // throws Error
    parseFilename: function (filename) {

        if (!this.isImageFilename(filename)) {
            throw new Error();
        }

        var results = LEGAL_FILENAME_WITH_RULE_REGEX.exec(filename);

        return {
            name: results[1],                                     // filename before micro media rule
            queries: this.parseMediaQueries(results[2] || ""),    // media rule (queries)
            extension: results[3]                                 // file extension
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
        if (!/^[0-9hwx\,\.\^]*$/i.test(rule)) {
            throw new Error("Illegal @media rule");
        }

        // split queries, e.g. "2x^640w,1x" -> ["2x^640w", "1x"] then
        // split exps, e.g. "2x^640w" -> ["2x", "640w"]
        var queries = rule.split(',');
        for (var i = 0; i < queries.length; i++) {
            var exps = queries[i].split('^');
            for (var j = 0; j < exps.length; j++) {
                exps[j] = this.parseMediaExpression(exps[j]);
            };
            queries[i] = exps;
        };

        return queries;
    },

    // accepts an media query expression string
    // returns CSS media query object
    // throws Error
    parseMediaExpression: function (expression) {
        if (!LEGAL_MEDIA_EXPRESSION_REGEX.test(expression)) {
            throw new Error("Illegal media query expression");
        }

        var exp = LEGAL_MEDIA_EXPRESSION_REGEX.exec(expression),
            feature;

        switch (exp[2]) {
        case 'x':
            feature = "min-device-pixel-ratio";
            break;
        case 'w':
            feature = "min-width";
            break;
        case 'h':
            feature = "min-height";
            break;
        default:
            throw new Error("Illegal media query expression");
        }

        return {
            feature: feature,
            value: parseFloat(exp[1]), // may throw Error
        }
    },

    // returns media rule substring if image filename contains one
    getMediaRule: function (filename) {
        return LEGAL_FILENAME_WITH_RULE_REGEX.exec(filename)[2] || null;
    },

    // returns media queries strings as array from filename
    getMediaQueries: function (filename) {
        var mediaString = this.getMediaRule(filename);
        if (mediaString) {
            return mediaString.split(',');
        }
        else {
            return [];
        }
    },

    // checks if string is a legal image filename
    isImageFilename: function (filename) {
        return LEGAL_FILENAME_REGEX.test(filename);
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
    },

    // accepts image file path
    // returns the basename sans -small and @ descriptors
    // e.g. `/path/to/noodle-small@1x.png` returns `noodle`
    getClassBaseFilename: function (filepath) {
        return path.basename(filepath).replace(/(-small)?\@[1, 2]x\.(png|jpg|jpeg|gif)$/, "");
    },

    // returns image ratio descriptor as float
    // TODO: add support for 1.5x, et al.
    getRatio: function (filename) {
        var matches = filename.match(/\@([1,2,3])x/);
        if (matches) {
            return parseFloat(matches[1]);
        }
        else {
            return null;
        }
    }
}

// export ImageFilenameHelper
for (i in ImageFilenameHelper) {
    exports[i] = ImageFilenameHelper[i];
}

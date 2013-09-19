//
// background-imager.js
//
// Copyright (C) 2013 Hector Guillermo Parra Alvarez (@hgparra)
// Released under The MIT License (MIT) - http://opensource.org/licenses/MIT
//

//
// RE: GraphicsMagick/ImageMagick (GM/IM)
//
// this depends on https://github.com/aheckmann/gm
// `npm install gm`
//

//
// RE: CSS Media Queries
//
// by definition media query expresions contain enclosing parentheses
// e.g. `(min-device-pixel-ratio: 2)`
// Source: http://www.w3.org/TR/css3-mediaqueries/#syntax
//

var path = require('path')
    , Q = require('q')
    , gm = require('gm')
    , im = gm.subClass({ imageMagick: true });

// string representing a single tab space
var DEFAULT_TAB = "  ";

// array of various media query expressions for 2x pixel ratios
var MEDIA_EXPRESSIONS_2X = [
    "(-webkit-min-device-pixel-ratio: 2)",
    "(min--moz-device-pixel-ratio: 2)",
    "(-o-min-device-pixel-ratio: 2/1)",
    "(min-device-pixel-ratio: 2)",
    "(min-resolution: 192dpi)",
    "(min-resolution: 2dppx)"
]

//
// PUBLIC
//

var BackgroundImager = {

    // checks if filename has an image extension
    isImage: function (filename) {
        return /\.(png|jpg|jpeg|gif)$/.test(filename);
    },

    // checks if filename has `-small` descriptor
    isSmallImage: function (filename) {
        return /-small\@/.test(filename);
    },

    // checks if filename does not have `-small` descriptor
    isNotSmallImage: function (filename) {
        return !BackgroundImager.isSmallImage(filename);
    },

    // checks if filename has `@1x` descriptor
    is1xImage: function (filename) {
        return /\@1x/.test(filename);
    },

    // checks if filename has `@2x` descriptor
    is2xImage: function (filename) {
        return /\@2x/.test(filename);
    },

    // returns the base filename sans - and @ descriptors
    // e.g. `noodle-small@1x.png` returns `noodle`
    getClassBaseFilename: function (filename) {
        return filename.replace(/(-small)?\@[1, 2]x\.(png|jpg|jpeg|gif)$/, "");
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
    },

    // generates 2x ratio media queries, all with additional media query expressions (optional)
    // accepts array of media query expressions
    // returns array of media queries
    generate2xMediaQueries: function (exps) {
        var queries = [];
        
        // seems [].concat will cast string into array with that string - good
        if (typeof exps === "undefined" || exps === null) {
            exps = [];
        }

        for (var i = 0, length = MEDIA_EXPRESSIONS_2X.length; i < length; ++i) {
            var exps2x = [];
            exps2x = exps2x.concat(exps);
            exps2x.push(MEDIA_EXPRESSIONS_2X[i]);
            queries.push(this.generateMediaQuery(exps2x));
        }

        return queries;
    },

    // accepts array of media query expressions
    // returns a single media query with `only screen` modifier and media type
    // e.g. `only screen and (min-device-pixel-ratio: 2)`
    generateMediaQuery: function (exps) {
        var mq = "only screen";
        if (exps.length > 0) {
            mq += " and ";
            mq += exps.join(" and ");
        }
        return mq;
    },

    // accepts array of media queries
    // returns a media query list as string
    generateMediaQueryList: function (queries) {
        var list = "";
        list += queries.join(",\n");
        return list;
    },

    // accepts image filename
    // generates a CSS RuleSet object containing selector and rules:
    // * `background-image`
    // * `width` and `height`, or `background-size`
    // returns promise of a RuleSet object
    generateRuleSet: function (filename, filepath, options, callback) {

        var settings;

        // options are optional
        if (typeof arguments[2] === "function") {
            settings = {};
            callback = arguments[2];
        }

        settings = {
            urlPath: options.urlPath || filepath,
            classPrefix: options.classPrefix || ""
        }

        var file = path.join(filepath, filename),                   // "/fs/path/to/image1x.png"
            url = path.join(settings.urlPath, filename),            // "/url/path/to/image1x.png"
            ruleset = {                                             // RuleSet object
                selector: "." + settings.classPrefix + BackgroundImager.getClassBaseFilename(filename),
                rules: {}
            };

        ruleset.rules["background-image"] = "url(\"" + url + "\")";
        //ruleset.rules["background-repeat"] = "no-repeat";

        // read image width/height
        im(file).size(function (err, size) {

            if (!err) {

                //
                // ratio determines which math and rules to employ
                //

                var ratio = BackgroundImager.getRatio(filename) || 1,
                    width = size.width / ratio + "px",
                    height = size.height / ratio + "px";

                if (ratio > 1) {
                    ruleset.rules["background-size"] = width + " " + height;
                } else {
                    ruleset.rules["width"] = width;
                    ruleset.rules["height"] = height;
                }
            }

            if (callback && typeof callback === "function") {
                callback.call(null, err, ruleset)
            }
        });

        //return deferred.promise;
    },

    // accepts MediaRule object
    // returns MediaRule as CSS (string)
    generateMediaRule: function (mediaRule, tabSpacing) {

        //
        tabSpacing = tabSpacing || DEFAULT_TAB;

        // returns string with n `TAB`s
        // FIXME: not effecient that I'm internal, but convenient
        function tabs (n) {
            var tabs = "";   
            for (var i = 0; i < n; i++) {
                tabs += tabSpacing;
            }
            return tabs;
        }

        var mediaRuleString = "",
            t = 0; // ident (tab) level

        // write beginning of MediaRule and MediaQueries
        if (mediaRule.queries !== null) {
            mediaRuleString += tabs(t) + "@media\n";
            mediaRuleString += tabs(t) + BackgroundImager.generateMediaQueryList(mediaRule.queries) + " {\n";
            t += 1;
        }

        // write each RuleSet
        mediaRule.rulesets.forEach(function (ruleset) {
            mediaRuleString += tabs(t) + ruleset.selector + " {\n";
            t += 1;
            for (var i in ruleset.rules) {
                mediaRuleString += tabs(t) +  i + ": " + ruleset.rules[i] + ";\n";
            }
            t -= 1;
            mediaRuleString += tabs(t) + "}\n";
        });

        // write end of Rule
        if (mediaRule.queries !== null) {
            t -= 1;
            mediaRuleString += "}\n";
        }

        return mediaRuleString;
    },

    // accepts array of abstract MediaRules (each with images array)
    // returns array of MediaRules
    createMediaRules: function (abstractMediaRules, filepath, options, callback) {

        var settings;

        // options are optional
        if (typeof arguments[2] === "function") {
            settings = {};
            callback = arguments[2];
        } else {
            settings = options;
        }

        // for each MediaRule we map through images to produce RuleSets
        // mapping and promises solve issue where:
        // * each RuleSet requires a fileread to complete
        // * all RuleSets must complete for each MediaRule to complete
        // * MediaRules must be written sequentially
        // * we would like to return to node-style callbacks
        Q.all(abstractMediaRules.map(function(abstactMediaRule) {

            var deferred = Q.defer();

            // generate RuleSet for each image
            Q.all(abstactMediaRule.images.map(function (filename) {
                var deferred = Q.defer();
                BackgroundImager.generateRuleSet(filename, filepath, settings, function(err, ruleset) {
                    if (err) {
                        deferred.reject(err);
                    }
                    deferred.resolve(ruleset);
                });
                return deferred.promise;
            }))
            .then(function (rulesets) {
                abstactMediaRule.rulesets = rulesets;
                deferred.resolve(abstactMediaRule);
            })
            .fail(function (err) {
                deferred.reject(err);
            });

            return deferred.promise;
        }))
        .then(function (mediaRules) {
            if (callback && typeof callback === "function") {
                callback.call(null, null, mediaRules);
            }
        })
        .fail(function (err) {
            if (callback && typeof callback === "function") {
                callback.call(null, err, null);
            }
        });
    },

    // accepts MediaRule array
    // returns CSS string
    generateCSS: function (mediaRules, tabSpacing) {
        var css = "";
        css += "/* Generated by background-imager.js */\n\n";
        mediaRules.forEach(function (mediaRule) {
            css += BackgroundImager.generateMediaRule(mediaRule, tabSpacing) + "\n";
        });
        return css;
    }
}

// export BackgroundImager
for (i in BackgroundImager) {
    exports[i] = BackgroundImager[i];
}

#!/usr/bin/env node

//
// background-imager
//
// Copyright (C) 2013 Hector Guillermo Parra Alvarez (@hgparra)
// Released under The MIT License (MIT) - http://opensource.org/licenses/MIT
//

//
// background-imager reads a directory for images with special descriptors
// to produce responsive CSS classes using background-image. It is particularly helpful
// when dealing with a large number of image classes with 2 or more image versions
//
// background imager understands the @1x, @2x, and -small descriptors
//
// Example: A directory with the following images will produce the proceeding CSS
//
// ```
// poodle@1x.jpg
// poodle@2x.jpg
// poodle-small@1x.jpg
// poodle-small@2x.jpg
// ```
//
// ```css
// .noodle {
//   background-image: url("test/images/noodle@1x.png");
//   width: 64px;
//   height: 64px;
// }
//
// @media only screen and (min-device-pixel-ratio: 2) {
//   .noodle {
//     background-image: url("test/images/noodle@2x.png");
//     background-size: 64px 64px;
//   }
// }
//
// @media only screen and (max-width: 480px) {
//   .noodle {
//     background-image: url("test/images/noodle-small@1x.png");
//     width: 28px;
//     height: 28px;
//   }
// }
//
// @media only screen and (max-width: 480px) and (min-device-pixel-ratio: 2) {
//   .noodle {
//     background-image: url("test/images/noodle-small@2x.png");
//     background-size: 28px 28px;
//   }
// }
// ```
//
// background-imager does not produce any images, but this feature may be added later
//

//
// RE: GraphicsMagick/ImageMagick (GM/IM)
//
// this depends on https://github.com/aheckmann/gm
// `npm install gm`
//
// Due to asynchronicity of GM/IM we use promises
//

//
// RE: CSS Media Queries
//
// by definition media query expresions contain enclosing parentheses
// e.g. `(min-device-pixel-ratio: 2)`
// Source: http://www.w3.org/TR/css3-mediaqueries/#syntax
//

var fs = require('fs')
    , path = require('path')
    , program = require('commander')
    , Q = require('q')
    , gm = require('gm')
    , im = gm.subClass({ imageMagick: true });

// options
program
  .version(require("./package.json").version)
  .usage('[options] <image-directory>')
  .option("-u, --url-path <url>", "use specified path instead of filepath for image URL", "")
  .option("-c, --class-prefix <prefix>", "add string prefix to CSS class name", "")
  .option("-t, --tab-spacing <tab>", "specify string to use as tab", "")
  .parse(process.argv);

// <image-directory> required
if (process.argv.length < 3) {
    program.help();
}

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

// options specified
var filepath = process.argv[2],
    urlPath = program.urlPath,
    classnamePrefix = program.classPrefix || "",
    tabSpacing = program.tabSpacing || DEFAULT_TAB;

// escape \t and \s properly
tabSpacing = tabSpacing.replace(/\\t/gi, '\t').replace(/\\s/gi, ' ');

// typical media query expression for mobile widths
// TODO: make option
var MEDIA_EXPRESSION_MOBILE_MAX_WIDTH = "(max-width: 480px)";

// returns string with n `TAB`s
function tabs(n) {
    var tabs = "";   
    for (var i = 0; i < n; i++) {
        tabs += tabSpacing;
    }
    return tabs;
}

// checks if filename has an image extension
function isImage (filename) {
    return /\.(png|jpg|jpeg|gif)$/.test(filename);
}

// checks if filename has `-small` descriptor
function isSmallImage (filename) {
    return /-small\@/.test(filename);
}

// checks if filename does not have `-small` descriptor
function isNotSmallImage (filename) {
    return !isSmallImage(filename);
}

// checks if filename has `@1x` descriptor
function is1xImage(filename) {
    return /\@1x/.test(filename);
}

// checks if filename has `@2x` descriptor
function is2xImage(filename) {
    return /\@2x/.test(filename);
}

// returns the base filename sans - and @ descriptors
// used as the name for CSS class
function getClassBaseFilename(filename) {
    return filename.replace(/(-small)?\@[1, 2]x\.(png|jpg|jpeg|gif)$/, "");
}

// returns image ratio descriptor as float
// TODO: add support for 1.5x, et al.
function getRatio(filename) {
    var matches = filename.match(/\@([1,2,3])x/);
    if (matches) {
        return parseFloat(matches[1]);
    }
    else {
        return null;
    }
}

// generates 2x ratio media queries, all with additional media query expressions (optional)
// accepts array of media query expressions
// returns array of media queries
function generate2xMediaQueries(exps) {
    var queries = [];
    
    // seems [].concat will cast string into array with that string - good
    if (typeof exps === "undefined" || exps === null) {
        exps = [];
    }

    for (var i = 0, length = MEDIA_EXPRESSIONS_2X.length; i < length; ++i) {
        var exps2x = [];
        exps2x = exps2x.concat(exps);
        exps2x.push(MEDIA_EXPRESSIONS_2X[i]);
        queries.push(generateMediaQuery(exps2x));
    }

    return queries;
}

// accepts array of media query expressions
// returns a single media query with `only screen` modifier and media type
function generateMediaQuery(exps) {
    var mq = "only screen";
    if (exps.length > 0) {
        mq += " and ";
        mq += exps.join(" and ");
    }
    return mq;
}

// accepts array of media queries
// returns a media query list as string
function generateMediaQueryList(queries) {
    var list = "";
    list += queries.join(",\n");
    return list;
}

// accepts image filename
// generates a CSS RuleSet object containing selector and rules:
// * `background-image`
// * `width` and `height`, or `background-size`
// returns promise of a RuleSet object
function generateRuleSet(filename) {
    
    var file = path.join(filepath, filename),                   // e.g. "/path/to/image1x.png"
        url = path.join((urlPath || filepath), filename),   
        ruleset = {                                 // RuleSet object
            selector: "." + classnamePrefix + getClassBaseFilename(filename),
            rules: {}
        };

    ruleset.rules["background-image"] = "url(\"" + url + "\")";
    //ruleset.rules["background-repeat"] = "no-repeat";

    var deferred = Q.defer();

    // read image width/height
    im(file).size(function (err, size) {

        // error reading image file
        if (err) {
            deferred.reject(err);
        }

        //
        // ratio determines which math and rules to employ
        //

        var ratio = getRatio(filename) || 1,
            width = size.width / ratio + "px",
            height = size.height / ratio + "px";

        if (ratio > 1) {
            ruleset.rules["background-size"] = width + " " + height;
        } else {
            ruleset.rules["width"] = width;
            ruleset.rules["height"] = height;
        }

        deferred.resolve(ruleset);
    });

    return deferred.promise;
}

// accepts MediaRule object
// writes MediaRule as CSS to stddout
function writeMediaRule(mediaRule) {

    // TODO: check if rule has rulesets
    // could possibly be empty

    var t = 0; // ident (tab) level

    // write beginning of MediaRule and MediaQueries
    if (mediaRule.queries !== null) {
        console.log(tabs(t) + "@media");
        console.log(tabs(t) + generateMediaQueryList(mediaRule.queries) + " {\n");
        t += 1;
    }

    // write each RuleSet
    mediaRule.rulesets.forEach(function (ruleset) {
        console.log(tabs(t) + ruleset.selector + " {");
        t += 1;
        for (var i in ruleset.rules) {
            console.log(tabs(t) +  i + ": " + ruleset.rules[i] + ";");
        }
        t -= 1;
        console.log(tabs(t) + "}\n");
    });

    // write end of Rule
    if (mediaRule.queries !== null) {
        t -= 1;
        console.log("}");
    }
}

// main
(function() {
    fs.readdir(filepath, function (err, files) {

        if (err) {
            throw err; // error reading directory
        }

        // filter image files from directory
        var images = files.filter(isImage);

        if (images.length === 0) {
            console.error("There are no images in specified directory.");
            process.exit(1);
        }

        // array of MediaRules, one for each scenario:
        // * 1x
        // * 2x
        // * mobile 1x
        // * mobile 2x
        //
        // each MediaRule object (will) contain(s):
        // * MediaQueries
        // * RuleSets
        // * image filenames (not part of CSS)
        var mediaRules = [{
            // 1x
            queries: null,
            images: images.filter(isNotSmallImage).filter(is1xImage)
        },{
            // 2x
            queries: generate2xMediaQueries(),
            images: images.filter(isNotSmallImage).filter(is2xImage)
        },{
            // mobile 1x
            queries: [
                generateMediaQuery([
                    MEDIA_EXPRESSION_MOBILE_MAX_WIDTH
                ])
            ],
            images: images.filter(isSmallImage).filter(is1xImage)
        },{
            // mobile 2x
            queries: generate2xMediaQueries([
                MEDIA_EXPRESSION_MOBILE_MAX_WIDTH
            ]),
            images: images.filter(isSmallImage).filter(is2xImage)
        }];

        // array of promises so we know when all MediaRules are completed
        // promises allow us to write MediaRules to stddout in proper order
        var mediaRulePromises = mediaRules.map(function(mediaRule) {

            var deferred = Q.defer();

            // generate RuleSet for each image
            Q.allSettled(mediaRule.images.map(generateRuleSet))
            .then(function (results) {

                // copy completed RuleSets into mediaRule.rulesets
                mediaRule.rulesets = [];
                results.forEach(function (result) {
                    mediaRule.rulesets.push(result.value);
                });

                deferred.resolve();
            })
            .fail(function (err) {
                // some RuleSet was not produced successfully
                deferred.reject(err);
            });

            return deferred.promise;
        });

        // if all MediaRules are ready
        // then write CSS to stdout
        Q.allSettled(mediaRulePromises)
        .then(function () {

            console.log("/* Generated by background-imager.js */\n");

            mediaRules.forEach(function (mediaRule) {
                writeMediaRule(mediaRule);
                console.log();
            });
        })
        .fail(function (err) {
            // some MediaRule was not completed successfully
            throw err;
        });

    });
})();

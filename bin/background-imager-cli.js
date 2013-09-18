#!/usr/bin/env node

//
// background-imager-cli.js
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

var program = require("commander"),
    bgi = require("../lib/background-imager.js"),
    fs = require('fs'),
    Q = require('q');

// options
program
    .version(require("../package.json").version)
    .usage('[options] <image-directory>')
    .option("-u, --url-path <url>", "use specified path instead of filepath for image URL", "")
    .option("-c, --class-prefix <prefix>", "add string prefix to CSS class name", "")
    .option("-t, --tab-spacing <tab>", "specify string to use as tab", "")
    .parse(process.argv);

// <image-directory> required
if (process.argv.length < 3) {
    program.help();
}

// typical media query expression for mobile widths
// TODO: make option
var MEDIA_EXPRESSION_MOBILE_MAX_WIDTH = "(max-width: 480px)";

// options specified
var filepath = process.argv[2],
    urlPath = program.urlPath,
    classnamePrefix = program.classPrefix || "",
    tabSpacing = program.tabSpacing;

// escape \t and \s properly
tabSpacing = tabSpacing.replace(/\\t/gi, '\t').replace(/\\s/gi, ' ');

//
// MAIN
//

(function() {

    // read top-directory only (no nested directory support)
    fs.readdir(filepath, function (err, files) {

        if (err) {
            console.error(err);
            console.error("There was an error reading the directory.");
            process.exit(1);
        }

        // filter image files from directory
        var images = files.filter(bgi.isImage);

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
            images: images.filter(bgi.isNotSmallImage).filter(bgi.is1xImage)
        },{
            // 2x
            queries: bgi.generate2xMediaQueries(),
            images: images.filter(bgi.isNotSmallImage).filter(bgi.is2xImage)
        },{
            // mobile 1x
            queries: [
                bgi.generateMediaQuery([
                    MEDIA_EXPRESSION_MOBILE_MAX_WIDTH
                ])
            ],
            images: images.filter(bgi.isSmallImage).filter(bgi.is1xImage)
        },{
            // mobile 2x
            queries: bgi.generate2xMediaQueries([
                MEDIA_EXPRESSION_MOBILE_MAX_WIDTH
            ]),
            images: images.filter(bgi.isSmallImage).filter(bgi.is2xImage)
        }];

        // array of promises so we know when all MediaRules are completed
        // promises allow us to write MediaRules to stddout in proper order
        var mediaRulePromises = mediaRules.map(function(mediaRule) {

            var deferred = Q.defer();

            // generate RuleSet for each image
            Q.allSettled(mediaRule.images.map(function (filename) {
                return bgi.generateRuleSet(filename, filepath, {
                    urlPath: urlPath,
                    classnamePrefix: classnamePrefix
                })
            }))
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
                console.log(bgi.generateMediaRule(mediaRule, tabSpacing));
            });
        })
        .fail(function (err) {
            console.error(err);
            console.error("Some MediaRule was not completed successfully");
            process.exit(1);
        });

    });
})();

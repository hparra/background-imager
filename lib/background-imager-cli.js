//
// background-imager-cli.js
//
// Copyright (C) 2013 Hector Guillermo Parra Alvarez (@hgparra)
// Released under The MIT License (MIT) - http://opensource.org/licenses/MIT
//

var bgi = require("./background-imager"),
    ifh = require("./image-filename-helper"),
    fs = require('fs');


var BackgroundImagerCLI = {
    run: function(filepath, options, callback) {

        // DEPRECATED
        // typical media query expression for mobile widths
        var MEDIA_EXPRESSION_MOBILE_MAX_WIDTH = "(max-width: 480px)";

        // escape \t and \s properly
        if (options.tabSpacing) {
            options.tabSpacing = options.tabSpacing.replace(/\\t/gi, '\t').replace(/\\s/gi, ' ');
        }

        // read top-directory only (no nested directory support)
        fs.readdir(filepath, function (err, files) {

            if (err) {
                callback.call(null, err, null);
            }

            // filter image files from directory
            var images = files.filter(ifh.isImage);

            if (images.length === 0) {
                callback.call(null, new Error("No images found"), null);
            }

            // DEPRECATED
            // array of abstract (incomplete) MediaRules, one for each scenario:
            // * 1x
            // * 2x
            // * mobile 1x
            // * mobile 2x
            //
            // each MediaRule object (will) contain(s):
            // * MediaQueries
            // * RuleSets
            // * image filenames (not part of CSS)
            var abstractMediaRules = [{
                // 1x
                queries: null,
                images: images.filter(ifh.isNotSmallImage).filter(ifh.is1xImage)
            },{
                // 2x
                queries: bgi.generate2xMediaQueries(),
                images: images.filter(ifh.isNotSmallImage).filter(ifh.is2xImage)
            },{
                // mobile 1x
                queries: [
                    bgi.generateMediaQuery([
                        MEDIA_EXPRESSION_MOBILE_MAX_WIDTH
                    ])
                ],
                images: images.filter(ifh.isSmallImage).filter(ifh.is1xImage)
            },{
                // mobile 2x
                queries: bgi.generate2xMediaQueries([
                    MEDIA_EXPRESSION_MOBILE_MAX_WIDTH
                ]),
                images: images.filter(ifh.isSmallImage).filter(ifh.is2xImage)
            }];

            // create media rules
            bgi.createMediaRules(abstractMediaRules, filepath, options, function(err, mediaRules) {

                if (err) {
                    callback.call(null, err, null);
                }

                callback.call(null, null, bgi.generateCSS(mediaRules, options.tabSpacing));
            });
        });
    }
}

// export BackgroundImagerCLI
for (i in BackgroundImagerCLI) {
    exports[i] = BackgroundImagerCLI[i];
}
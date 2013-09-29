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
            var imageFilenames = files.filter(ifh.isImage);

            if (imageFilenames.length === 0) {
                callback.call(null, new Error("No images found"), null);
            }

            // create media rules
            bgi.createMediaRules(imageFilenames, filepath, options, function(err, mediaRules) {

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
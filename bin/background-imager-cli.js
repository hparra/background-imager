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
// Example: A directory with the following images will produce similar CSS:
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
    cli = require("../lib/background-imager-cli");

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
else {
    cli.run(process.argv[2], program, function (err, data) {
        if (err) {
            console.error(err);
            process.exit(1); 
        }

        console.log(data);
    });
}

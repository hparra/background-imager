//
// image-filename-helper.js
//
// Copyright (C) 2013 Hector Guillermo Parra Alvarez (@hgparra)
// Released under The MIT License (MIT) - http://opensource.org/licenses/MIT
//

var ImageFilenameHelper = {
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
        return !ImageFilenameHelper.isSmallImage(filename);
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
    }
}

// export ImageFilenameHelper
for (i in ImageFilenameHelper) {
    exports[i] = ImageFilenameHelper[i];
}

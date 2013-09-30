var should = require('should'),
    helper = require("../lib/image-filename-helper"),
    bgi = require("../lib/background-imager"),
    fs = require("fs");

describe("BackgroundImager", function () {

    // TODO: expand
    describe("#getImageFileInfo", function () {
        // noodle@1x.png
        it("should return the expected file info \"noodle@1x.png\"", function (done) {
            bgi.getImageFileInfo("test/images/noodle@1x.png", function(err, imageFileInfo) {
                if (err) {
                    done(err);
                }

                imageFileInfo.should.include({
                    filepath: "test/images/noodle@1x.png",
                    classname: "noodle",
                    queries: ["1x"],
                    width: 64,
                    height: 64
                })
                done();
            })
        })
        // noodle@2x.png
        it("should return the expected file info \"noodle@2x.png\"", function (done) {
            bgi.getImageFileInfo("test/images/noodle@2x.png", function(err, imageFileInfo) {
                if (err) {
                    done(err);
                }

                imageFileInfo.should.include({
                    filepath: "test/images/noodle@2x.png",
                    classname: "noodle",
                    queries: ["2x"],
                    width: 128,
                    height: 128
                })
                done();
            })
        })
    })

    // TODO: expand
    describe("#getImageFileInfoArray", function () {

        var filepaths = [
            "test/images/noodle@1x.png",
            "test/images/noodle@2x.png"
        ];

        // before(function (done) {
        //     fs.readdir("test/images/", function (err, files) {
        //         if (err) {
        //             done(err);
        //         }
        //         filepaths = files;
        //         done();
        //     })
        // })

        it("should return the expected file info array for images in \"test/images/\"", function (done) {
            bgi.getImageFileInfoArray(filepaths, function (err, imageFileInfoArray) {
                if (err) {
                    done(err);
                }
                imageFileInfoArray.should.be.instanceOf(Array);
                imageFileInfoArray.should.includeEql({
                    filepath: "test/images/noodle@1x.png",
                    classname: "noodle",
                    queries: ["1x"],
                    width: 64,
                    height: 64
                })
                imageFileInfoArray.should.includeEql({
                    filepath: "test/images/noodle@2x.png",
                    classname: "noodle",
                    queries: ["2x"],
                    width: 128,
                    height: 128
                })
                done();
            })
        });
    })
})
var should = require('should'),
    helper = require("../lib/image-filename-helper"),
    bgi = require("../lib/background-imager"),
    fs = require("fs");

describe("BackgroundImager", function () {

    //
    // getImageFileInfo
    //

    describe("#getImageFileInfo", function () {
        // noodle@1x.png
        it("should return the expected file info \"noodle@1x^480w.png\"", function (done) {
            bgi.getImageFileInfo("test/images/noodle@1x^480w.png", function(err, imageFileInfo) {
                if (err) {
                    done(err);
                }

                imageFileInfo.should.include({
                    filepath: "test/images/noodle@1x^480w.png",
                    classname: "noodle",
                    queries: ["1x^480w"],
                    width: 32,
                    height: 32
                })
                done();
            })
        })
        // noodle@1x,2x^480w.png
        it("should return the expected file info \"noodle@1x,2x^480w.png\"", function (done) {
            bgi.getImageFileInfo("test/images/noodle@1x,2x^480w.png", function(err, imageFileInfo) {
                if (err) {
                    done(err);
                }

                imageFileInfo.should.include({
                    filepath: "test/images/noodle@1x,2x^480w.png",
                    classname: "noodle",
                    queries: [
                        "1x",
                        "2x^480w"
                    ],
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

    //
    // getImageFileInfoArray
    //

    describe("#getImageFileInfoArray", function () {

        var filepaths = [
            "test/images/noodle@1x,2x^480w.png",
            "test/images/noodle@1x^480w.png",
            "test/images/noodle@2x.png"
        ];

        it("should return the expected file info array for images in \"test/images/\"", function (done) {
            bgi.getImageFileInfoArray(filepaths, function (err, imageFileInfoArray) {
                if (err) {
                    done(err);
                }
                imageFileInfoArray.should.be.instanceOf(Array);
                imageFileInfoArray.should.includeEql({
                    filepath: "test/images/noodle@1x,2x^480w.png",
                    classname: "noodle",
                    queries: [
                        "1x",
                        "2x^480w"
                    ],
                    width: 64,
                    height: 64
                })
                imageFileInfoArray.should.includeEql({
                    filepath: "test/images/noodle@1x^480w.png",
                    classname: "noodle",
                    queries: [
                        "1x^480w"
                    ],
                    width: 32,
                    height: 32
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

    //
    // groupImageFileInfoByQuery
    //

    // NOTE: ugly test - is there a better way to do this?
    describe("#groupImageFileInfoByQuery", function () {
        var imageFileInfoArray = [{
            filepath: "test/images/noodle@1x,2x^480w.png",
            classname: "noodle",
            queries: [
                "1x",
                "2x^480w"
            ],
            width: 64,
            height: 64
        }, {
            filepath: "test/images/noodle@1x^480w.png",
            classname: "noodle",
            queries: [
                "1x^480w"
            ],
            width: 32,
            height: 32
        }, {
            filepath: "test/images/noodle@2x.png",
            classname: "noodle",
            queries: ["2x"],
            width: 128,
            height: 128
        }]

        var expectedImageFileInfoHash = {
            '1x': [{
                filepath: 'test/images/noodle@1x,2x^480w.png',
                classname: 'noodle',
                queries: [
                    "1x",
                    "2x^480w"
                ],
                width: 64,
                height: 64
            }],
            '2x^480w': [{
                filepath: 'test/images/noodle@1x,2x^480w.png',
                classname: 'noodle',
                queries: [
                    "1x",
                    "2x^480w"
                ],
                width: 64,
                height: 64 
            }],
            '1x^480w': [{
                filepath: 'test/images/noodle@1x^480w.png',
                classname: 'noodle',
                queries: [
                    "1x^480w"
                ],
                width: 32,
                height: 32
            }],
            '2x': [{
                filepath: 'test/images/noodle@2x.png',
                classname: 'noodle',
                queries: ["2x"],
                width: 128,
                height: 128
            }]
        }

        it("should return expected imageFileInfoHash", function () {
            bgi.groupImageFileInfoByQuery(imageFileInfoArray).should.eql(expectedImageFileInfoHash);
        })
    })
})
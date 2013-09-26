var should = require('should'),
	helper = require("../lib/image-filename-helper");

describe("ImageFilenameHelper", function () {

	var LEGAL_FILENAMES = [
		"noodle.png",
		"noodle.gif",
		"noodle.jpg",
		"noodle.jpeg",
		"noodle.JPEG"
	];

	var ILLEGAL_FILENAMES = [
		"noodle.ping",
		"noodle.jpg.exe",
		"noodle.psd"
	];

	var HAS_NULL = "noodle.jpg",
		HAS_1X = "noodle@1x.jpg",
		HAS_1X_AND_640W = "noodle@1x^640w.jpg",
		HAS_1X_OR_2X_AND_640W = "noodle@2x^640w,1x.jpg",
		HAS_2X = "noodle@2x.jpg",
		HAS_2X_AND_640W = "noodle@2x^640w.jpg",
		HAS_2X_AND_640W_OR_1X = "noodle@1x,2x^640w.jpg",
		HAS_1X_AND_640W_REVERSED = "noodle@640w^1x.jpg",
		HAS_1X_OR_2X_AND_640W_REVERSED = "noodle@640w^2x,1x.jpg",
		HAS_2X_AND_640W_REVERSED = "noodle@640w^2x.jpg",
		HAS_2X_AND_640W_OR_1X_REVERSED = "noodle@1x,640w^2x.jpg";

	//
	// isImage()
	//

	describe("#isImage", function () {
		// true
		it("should return true when file has a compatible image extension", function () {
			for (var i = LEGAL_FILENAMES.length - 1; i >= 0; i--) {
				helper.isImage(LEGAL_FILENAMES[i]).should.equal(true, LEGAL_FILENAMES[i]);
			};
		})
		// false
		it("should return false when file does not have a (compatible) image extension", function () {
			for (var i = ILLEGAL_FILENAMES.length - 1; i >= 0; i--) {
				helper.isImage(ILLEGAL_FILENAMES[i]).should.equal(false, ILLEGAL_FILENAMES[i]);
			};
		})
	})

	//
	// is1xImage()
	//

	describe("#is1xImage", function () {
		it("should return true when file has `1x` descriptor", function () {
			helper.is1xImage(HAS_1X).should.equal(true, HAS_1X);
			helper.is1xImage(HAS_1X_AND_640W).should.equal(true, HAS_1X_AND_640W);
			helper.is1xImage(HAS_1X_OR_2X_AND_640W).should.equal(true, HAS_1X_OR_2X_AND_640W);
			helper.is1xImage(HAS_2X_AND_640W_OR_1X).should.equal(true, HAS_2X_AND_640W_OR_1X);
			helper.is1xImage(HAS_1X_AND_640W_REVERSED).should.equal(true, HAS_1X_AND_640W_REVERSED);
			helper.is1xImage(HAS_1X_OR_2X_AND_640W_REVERSED).should.equal(true, HAS_1X_OR_2X_AND_640W_REVERSED);
			helper.is1xImage(HAS_2X_AND_640W_OR_1X_REVERSED).should.equal(true, HAS_2X_AND_640W_OR_1X_REVERSED);
		})
		it("should return false when file does not have `1x` descriptor", function () {
			helper.is1xImage(HAS_NULL).should.equal(false, HAS_NULL);
			helper.is1xImage(HAS_2X).should.equal(false, HAS_2X);
			helper.is1xImage(HAS_2X_AND_640W).should.equal(false, HAS_2X_AND_640W);
			helper.is1xImage(HAS_2X_AND_640W_REVERSED).should.equal(false, HAS_2X_AND_640W_REVERSED);
		})
	})

	//
	// is2xImage()
	//

	describe("#is2xImage", function () {
		it("should return true when file has `2x` descriptor", function () {
			helper.is2xImage(HAS_2X).should.equal(true, HAS_2X);
			helper.is2xImage(HAS_2X_AND_640W).should.equal(true, HAS_2X_AND_640W);
			helper.is2xImage(HAS_1X_OR_2X_AND_640W).should.equal(true, HAS_1X_OR_2X_AND_640W);
			helper.is2xImage(HAS_2X_AND_640W_OR_1X).should.equal(true, HAS_2X_AND_640W_OR_1X);
			helper.is2xImage(HAS_1X_OR_2X_AND_640W_REVERSED).should.equal(true, HAS_1X_OR_2X_AND_640W_REVERSED);
			helper.is2xImage(HAS_2X_AND_640W_OR_1X_REVERSED).should.equal(true, HAS_2X_AND_640W_OR_1X_REVERSED);
			helper.is2xImage(HAS_2X_AND_640W_REVERSED).should.equal(true, HAS_2X_AND_640W_REVERSED);
		})
		it("should return false when file does not have `2x` descriptor", function () {
			helper.is2xImage(HAS_NULL).should.equal(false, HAS_NULL);
			helper.is2xImage(HAS_1X).should.equal(false, HAS_1X);
			helper.is2xImage(HAS_1X_AND_640W).should.equal(false, HAS_1X_AND_640W);
			helper.is2xImage(HAS_1X_AND_640W_REVERSED).should.equal(false, HAS_1X_AND_640W_REVERSED);

		})
	})
})
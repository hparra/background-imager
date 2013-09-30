var should = require('should'),
	helper = require("../lib/image-filename-helper");

describe("ImageFilenameHelper", function () {

	// are these actually helpful? Makes tests harder to read
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
	// Tests for @media parser methods
	//

	describe("(Parsers)", function() {

		//
		// parseMediaDescriptorAsExpressionObject
		//

		describe("#parseMediaDescriptorAsExpressionObject", function () {
			// 640w
			it("should return correct @media descriptor object when descriptor is \"640w\"", function () {
				helper.parseMediaDescriptorAsExpressionObject("640w").should.include({
					feature: "min-width",
					value: 640
				});
			})
			// 1x
			it("should return correct @media descriptor object when descriptor is \"1x\"", function () {
				helper.parseMediaDescriptorAsExpressionObject("1x").should.include({
					feature: "min-device-pixel-ratio",
					value: 1
				});
			})
			// 1.5x
			it("should return correct @media descriptor object when descriptor is \"1.5x\"", function () {
				helper.parseMediaDescriptorAsExpressionObject("1.5x").should.include({
					feature: "min-device-pixel-ratio",
					value: 1.5
				});
			})
			// 768h
			it("should return correct @media descriptor object when descriptor is \"768h\"", function () {
				helper.parseMediaDescriptorAsExpressionObject("768h").should.include({
					feature: "min-height",
					value: 768
				});
			})
			// null
			it("should throw error when descriptor is `null`", function () {
				(function () {
					helper.parseMediaDescriptorAsExpressionObject(null);
				}).should.throwError(/descriptor/);
			})
			// ""
			it("should throw error when descriptor is empty string", function () {
				(function () {
					helper.parseMediaDescriptorAsExpressionObject("");
				}).should.throwError(/descriptor/);
			})
			// 640z
			it("should throw error when descriptor is \"640z\"", function () {
				(function () {
					helper.parseMediaDescriptorAsExpressionObject("640z");
				}).should.throwError(/descriptor/);
			})
			// x
			it("should throw error when descriptor is \"x\"", function () {
				(function () {
					helper.parseMediaDescriptorAsExpressionObject("x");
				}).should.throwError(/descriptor/);
			})
			// 640w^2x
			it("should throw error when descriptor is \"640w^2x\"", function () {
				(function () {
					helper.parseMediaDescriptorAsExpressionObject("640w^2x");
				}).should.throwError(/descriptor/);
			})
		})

		//
		// parseMediaQueries
		//

		describe("#parseMediaQueries", function () {
			// ""
			it("should return correct media queries array when query string is empty", function () {
				helper.parseMediaQueries("").should.be.instanceOf(Array).and.be.empty;
			});
			// 1x
			it("should return correct media queries array when query string is \"1x\"", function () {
				helper.parseMediaQueries("1x").should.be.instanceOf(Array)
					.and.includeEql(
						[{
							feature: "min-device-pixel-ratio",
							value: 1
						}]
					);
			});
			// 1x^640w
			it("should return correct media queries array when query string is \"1x^640w\"", function () {
				helper.parseMediaQueries("1x^640w").should.be.instanceOf(Array)
					.and.includeEql(
						[{
							feature: "min-device-pixel-ratio",
							value: 1
						},{
							feature: "min-width",
							value: 640
						}]
					);
			});
			// 640w^2x,1x
			it("should return correct media queries array when query string is \"640w^2x,1x\"", function () {
				helper.parseMediaQueries("640w^2x,1x").should.be.instanceOf(Array)
					.and.includeEql(
						[{
							feature: "min-width",
							value: 640
						},{
							feature: "min-device-pixel-ratio",
							value: 2
						}]
					)
					.and.includeEql(
						[{
							feature: "min-device-pixel-ratio",
							value: 1
						}]
					);
			})
			// null
			it("should throw error when query string is `null`", function () {
				(function () {
					helper.parseMediaQueries(null);
				}).should.throwError(/rule/);
			})
		})

		//
		// parseFilename
		//

		describe("#parseFilename", function () {
			// noodle.jpg
			it("should return correct image file object when filename is \"noodle.jpg\"", function () {
				var obj = helper.parseFilename("noodle.jpg");
				obj.should.be.instanceOf(Object);
				obj.should.have.property("name", "noodle");
				obj.should.have.property("extension", "jpg");
				obj.should.have.property("queries")
					.and.be.instanceOf(Array).and.be.empty;
			})
			// noodle@1x^640w.jpg
			it("should return correct image file object when filename is \"noodle@1x^640w.jpg\"", function () {
				var obj = helper.parseFilename("noodle@1x^640w.jpg");
				obj.should.be.instanceOf(Object);
				obj.should.have.property("name", "noodle");
				obj.should.have.property("extension", "jpg");
				obj.should.have.property("queries")
					.and.be.instanceOf(Array)
					.and.includeEql(
						[{
							feature: "min-device-pixel-ratio",
							value: 1
						},{
							feature: "min-width",
							value: 640
						}]
					);
			})
			// noodle@640w^2x,1x.jpg
			it("should return correct image file object when filename is \"noodle@640w^2x,1x.jpg\"", function () {
				var obj = helper.parseFilename("noodle@640w^2x,1x.jpg");
				obj.should.be.instanceOf(Object);
				obj.should.have.property("name", "noodle");
				obj.should.have.property("extension", "jpg");
				obj.should.have.property("queries")
					.and.be.instanceOf(Array)
					.and.includeEql(
						[{
							feature: "min-width",
							value: 640
						},{
							feature: "min-device-pixel-ratio",
							value: 2
						}]
					)
					.and.includeEql(
						[{
							feature: "min-device-pixel-ratio",
							value: 1
						}]
					);
			})
		})
	})

	//
	// Tests for helpers
	//

	describe("(Helpers)", function() {

		//
		// getMediaRule()
		//

		describe("#getMediaRule", function () {
			// noodle.jpg
			it("should return `null` when filename is \"noodle.jpg\"", function () {
				should.equal(helper.getMediaRule("noodle.jpg"), null);
			})
			// noodle@1x.jpg
			it("should return correct substring when filename is \"noodle@1x.jpg\"", function () {
				helper.getMediaRule("noodle@1x.jpg").should.equal("1x");
			})
			// noodle@1x^640w.jpg
			it("should return correct substring when filename is \"noodle@1x^640w.jpg\"", function () {
				helper.getMediaRule("noodle@1x^640w.jpg").should.equal("1x^640w");
			})
			// noodle@640w^2x,1x.jpg
			it("should return correct substring when filename is \"noodle@640w^2x,1x.jpg\"", function () {
				helper.getMediaRule("noodle@640w^2x,1x.jpg").should.equal("640w^2x,1x");
			})
		})

		//
		// getMediaQueries()
		//

		describe("#getMediaQueries", function () {
			// noodle.jpg
			it("should return empty array when filename is \"noodle.jpg\"", function () {
				helper.getMediaQueries("noodle.jpg").should.be.instanceOf(Array).and.empty;
			})
			// noodle@1x.jpg
			it("should return correct array when filename is \"noodle@1x.jpg\"", function () {
				helper.getMediaQueries("noodle@1x.jpg").should.include("1x");
			})
			// noodle@1x^640w.jpg
			it("should return correct array when filename is \"noodle@1x^640w.jpg\"", function () {
				helper.getMediaQueries("noodle@1x^640w.jpg").should.include("1x^640w");
			})
			// noodle@640w^2x,1x.jpg
			it("should return correct array when filename is \"noodle@640w^2x,1x.jpg\"", function () {
				helper.getMediaQueries("noodle@640w^2x,1x.jpg").should.include("640w^2x").and.include("1x");
			})
		})

		//
		// isImage()
		//

		describe("#isImage", function () {
			// true
			it("should return true when file has a compatible image extension", function () {
				helper.isImage("noodle.png").should.equal(true);
				helper.isImage("noodle.gif").should.equal(true);
				helper.isImage("noodle.jpeg").should.equal(true);
				helper.isImage("noodle.jpg").should.equal(true);
			})
			// false
			it("should return false when file does not have a (compatible) image extension", function () {
				helper.isImage("noodle.ping").should.equal(false);
				helper.isImage("noodle.psd").should.equal(false);
				helper.isImage("noodle.pdf").should.equal(false);
				helper.isImage("noodle.bmp").should.equal(false);
			})
		})
	})

	//
	// DEPRECATED
	//

	describe("(DEPRECATED)", function () {

		//
		// is1xImage()
		//

		describe("#is1xImage", function () {
			// true
			it("should return true when file has \"1x\" descriptor", function () {
				helper.is1xImage(HAS_1X).should.equal(true, HAS_1X);
				helper.is1xImage(HAS_1X_AND_640W).should.equal(true, HAS_1X_AND_640W);
				helper.is1xImage(HAS_1X_OR_2X_AND_640W).should.equal(true, HAS_1X_OR_2X_AND_640W);
				helper.is1xImage(HAS_2X_AND_640W_OR_1X).should.equal(true, HAS_2X_AND_640W_OR_1X);
				helper.is1xImage(HAS_1X_AND_640W_REVERSED).should.equal(true, HAS_1X_AND_640W_REVERSED);
				helper.is1xImage(HAS_1X_OR_2X_AND_640W_REVERSED).should.equal(true, HAS_1X_OR_2X_AND_640W_REVERSED);
				helper.is1xImage(HAS_2X_AND_640W_OR_1X_REVERSED).should.equal(true, HAS_2X_AND_640W_OR_1X_REVERSED);
			})
			// false
			it("should return false when file does not have \"1x\" descriptor", function () {
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
			// true
			it("should return true when file has \"2x\" descriptor", function () {
				helper.is2xImage(HAS_2X).should.equal(true, HAS_2X);
				helper.is2xImage(HAS_2X_AND_640W).should.equal(true, HAS_2X_AND_640W);
				helper.is2xImage(HAS_1X_OR_2X_AND_640W).should.equal(true, HAS_1X_OR_2X_AND_640W);
				helper.is2xImage(HAS_2X_AND_640W_OR_1X).should.equal(true, HAS_2X_AND_640W_OR_1X);
				helper.is2xImage(HAS_1X_OR_2X_AND_640W_REVERSED).should.equal(true, HAS_1X_OR_2X_AND_640W_REVERSED);
				helper.is2xImage(HAS_2X_AND_640W_OR_1X_REVERSED).should.equal(true, HAS_2X_AND_640W_OR_1X_REVERSED);
				helper.is2xImage(HAS_2X_AND_640W_REVERSED).should.equal(true, HAS_2X_AND_640W_REVERSED);
			})
			// false
			it("should return false when file does not have \"2x\" descriptor", function () {
				helper.is2xImage(HAS_NULL).should.equal(false, HAS_NULL);
				helper.is2xImage(HAS_1X).should.equal(false, HAS_1X);
				helper.is2xImage(HAS_1X_AND_640W).should.equal(false, HAS_1X_AND_640W);
				helper.is2xImage(HAS_1X_AND_640W_REVERSED).should.equal(false, HAS_1X_AND_640W_REVERSED);

			})
		})
	})
})
var should = require('should'),
	helper = require("../lib/image-filename-helper"),
	cli = require("../lib/background-imager-cli"),
	fs = require("fs");

describe("BackgroundImagerCLI", function () {

	var expectedCSS;

	before(function (done) {
		fs.readFile("test/noodle.css", "utf8", function (err, data) {

			if (err) {
				return done(err);
			}

			expectedCSS = data;
			done();
		})
	})

	it("should return expected CSS (noodle.css)", function (done) {
		cli.run("test/images/", {
			urlPath: "images/"
		}, function (err, data) {
			if (err) {
				return done(err);
			}

			data.should.equal(expectedCSS, data);
			done();
		});
	})

	it("should return a \"No images found\" error", function (done) {
		cli.run("test/", {}, function (err, data) {
			if (err) {
				err.message.should.equal("No images found");
				done();
			}
		});
	})
})
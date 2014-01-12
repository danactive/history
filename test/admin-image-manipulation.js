/*global __dirname, console, describe, it, require*/
var expect = require("expect.js");

describe('Admin:', function () {
	describe('Image manipulation:', function () {
		var page = require("../js/admin-image-manipulation.js");
		describe('ensureDestinationDirectory()', function () {
			it('should fail without argument', function (done) {
				var arg;
				expect(page.ensureDestinationDirectory).withArgs(arg).to.throwException(function (exception) { // get the exception object
					expect(exception).to.be.a(ReferenceError);
					expect(page.ensureDestinationDirectory).withArgs(arg).to.throwException(new RegExp(page.error.missingArg));
					done();
				});
			});
			it('should fail without prefix argument', function (done) {
				var arg = {};
				expect(page.ensureDestinationDirectory).withArgs(arg).to.throwException(function (exception) { // get the exception object
					expect(exception).to.be.a(ReferenceError);
					expect(page.ensureDestinationDirectory).withArgs(arg).to.throwException(new RegExp(page.error.missingArgFolderName));
					done();
				});
			});
			it('should verify test folders', function (done) {
				var arg,
					fs = require('fs'),
					testFolder = "/test/fixture/galleries/",
					verifiedPaths;
				arg = {"folderName": 'testAlbum', "destinationRootPath": require('path').dirname(__dirname) + testFolder};
				verifiedPaths = page.ensureDestinationDirectory(arg);
				expect(verifiedPaths).to.be.an('array');
				expect(verifiedPaths[0]).to.contain(testFolder + 'originals/' + arg.folderName);
				expect(verifiedPaths[1]).to.contain(testFolder + 'photos/' + arg.folderName);
				expect(verifiedPaths[2]).to.contain(testFolder + 'thumbs/' + arg.folderName);
				expect(fs.existsSync(verifiedPaths[0])).to.be(true);
				expect(fs.existsSync(verifiedPaths[1])).to.be(true);
				expect(fs.existsSync(verifiedPaths[2])).to.be(true);
				done();
			});
		});/*
		describe('future', function () {
			it('should fail without day count argument', function (done) {
				var arg = {"folderName": ""};
				expect(page.ensureDestinationDirectory).withArgs(arg).to.throwException(function (exception) { // get the exception object
					expect(exception).to.be.a(ReferenceError);
					expect(page.ensureDestinationDirectory).withArgs(arg).to.throwException(new RegExp(page.error.missingArgSourcePath));
					done();
				});
			});
		});*/
	});
});
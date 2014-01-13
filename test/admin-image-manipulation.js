/*global __dirname, console, describe, it, require*/
var expect = require("expect.js");

describe('Admin:', function () {
	describe('Image manipulation:', function () {
		var page = require("../js/admin-image-manipulation.js");
		describe('ensureDestinationFolder()', function () {
			it('should fail without argument', function (done) {
				var arg;
				expect(page.ensureDestinationFolder).withArgs(arg).to.throwException(function (exception) { // get the exception object
					expect(exception).to.be.a(ReferenceError);
					expect(page.ensureDestinationFolder).withArgs(arg).to.throwException(new RegExp(page.error.missingArg));
					done();
				});
			});
			it('should fail without prefix argument', function (done) {
				var arg = {};
				expect(page.ensureDestinationFolder).withArgs(arg).to.throwException(function (exception) { // get the exception object
					expect(exception).to.be.a(ReferenceError);
					expect(page.ensureDestinationFolder).withArgs(arg).to.throwException(new RegExp(page.error.missingArgFolderName));
					done();
				});
			});
			it('should verify test folders', function (done) {
				var arg,
					fs = require('fs'),
					testFolder = "/test/fixture/galleries/",
					verifiedPaths;
				arg = {"folderName": 'testAlbum', "destinationRootPath": require('path').dirname(__dirname) + testFolder};
				verifiedPaths = page.ensureDestinationFolder(arg);
				expect(verifiedPaths).to.be.an('array');
				expect(verifiedPaths[0]).to.contain(testFolder + 'originals/' + arg.folderName);
				expect(verifiedPaths[1]).to.contain(testFolder + 'photos/' + arg.folderName);
				expect(verifiedPaths[2]).to.contain(testFolder + 'thumbs/' + arg.folderName);
				expect(fs.existsSync(verifiedPaths[0])).to.be(true);
				expect(fs.existsSync(verifiedPaths[1])).to.be(true);
				expect(fs.existsSync(verifiedPaths[2])).to.be(true);
				done();
			});
		});
		describe('movePhotosToDestinationOriginal()', function () {
			it('should fail without argument', function (done) {
				var arg;
				expect(page.movePhotosToDestinationOriginal).withArgs(arg).to.throwException(function (exception) { // get the exception object
					expect(exception).to.be.a(ReferenceError);
					expect(page.movePhotosToDestinationOriginal).withArgs(arg).to.throwException(new RegExp(page.error.missingArg));
					done();
				});
			});
			it('should fail without sourceFolderPath argument', function (done) {
				var arg = {};
				expect(page.movePhotosToDestinationOriginal).withArgs(arg).to.throwException(function (exception) { // get the exception object
					expect(exception).to.be.a(ReferenceError);
					expect(page.movePhotosToDestinationOriginal).withArgs(arg).to.throwException(new RegExp(page.error.missingArgSourcePath));
					done();
				});
			});
			it('should fail without currentFiles argument', function (done) {
				var arg = {"sourceFolderPath": ''};
				expect(page.movePhotosToDestinationOriginal).withArgs(arg).to.throwException(function (exception) { // get the exception object
					expect(exception).to.be.a(ReferenceError);
					expect(page.movePhotosToDestinationOriginal).withArgs(arg).to.throwException(new RegExp(page.error.missingArgCurrentFiles));
					done();
				});
			});
			it('should fail without newFiles argument', function (done) {
				var arg = {"sourceFolderPath": '', "currentFiles": ["j1.jpeg"]};
				expect(page.movePhotosToDestinationOriginal).withArgs(arg).to.throwException(function (exception) { // get the exception object
					expect(exception).to.be.a(ReferenceError);
					expect(page.movePhotosToDestinationOriginal).withArgs(arg).to.throwException(new RegExp(page.error.missingArgNewFiles));
					done();
				});
			});
			it('should pass', function (done) {
				var arg1 = {
						"destinationRootPath": "test/fixture/",
						"sourceFolderPath": 'test/fixture/',
						"currentFiles": ["renamable.txt"],
						"newFiles": ["warning-mocha-test-failed-during-rename.txt"]
					},
					arg2,
					fs = require('fs');
				arg2 = JSON.parse(JSON.stringify(arg1)); // clone
				arg2.currentFiles = arg1.newFiles;
				arg2.newFiles = arg1.currentFiles;
				
				page.movePhotosToDestinationOriginal(arg1, function () {
					var filename1 = arg1.destinationRootPath + arg1.newFiles[0];
						expect(fs.existsSync(filename1).toString() + "-first").to.be("true-first");

					page.movePhotosToDestinationOriginal(arg2, function () {
						var filename2 = arg2.destinationRootPath + arg2.newFiles[0];
						expect(fs.existsSync(filename2).toString() + "-second").to.be("true-second");
						done();
					});
				});
			});
		});
	});
});
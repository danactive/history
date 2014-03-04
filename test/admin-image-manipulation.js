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
		describe('movePhotos()', function () {
			it('should fail without argument', function (done) {
				var arg;
				expect(page.movePhotos).withArgs(arg).to.throwException(function (exception) { // get the exception object
					expect(exception).to.be.a(ReferenceError);
					expect(page.movePhotos).withArgs(arg).to.throwException(new RegExp(page.error.missingArg));
					done();
				});
			});
			it('should fail without sourceFolderPath argument', function (done) {
				var arg = {};
				expect(page.movePhotos).withArgs(arg).to.throwException(function (exception) { // get the exception object
					expect(exception).to.be.a(ReferenceError);
					expect(page.movePhotos).withArgs(arg).to.throwException(new RegExp(page.error.missingArgSourcePath));
					done();
				});
			});
			it('should fail without folder name argument', function (done) {
				var arg = {"sourceFolderPath": ''};
				expect(page.movePhotos).withArgs(arg).to.throwException(function (exception) { // get the exception object
					expect(exception).to.be.a(ReferenceError);
					expect(page.movePhotos).withArgs(arg).to.throwException(new RegExp(page.error.missingArgFolderName));
					done();
				});
			});
			it('should fail without currentFiles argument', function (done) {
				var arg = {"sourceFolderPath": '',"folderName": ""};
				expect(page.movePhotos).withArgs(arg).to.throwException(function (exception) { // get the exception object
					expect(exception).to.be.a(ReferenceError);
					expect(page.movePhotos).withArgs(arg).to.throwException(new RegExp(page.error.missingArgCurrentFiles));
					done();
				});
			});
			it('should fail without newFiles argument', function (done) {
				var arg = {"sourceFolderPath": '', "currentFiles": ["j1.jpeg"], "folderName": ""};
				expect(page.movePhotos).withArgs(arg).to.throwException(function (exception) { // get the exception object
					expect(exception).to.be.a(ReferenceError);
					expect(page.movePhotos).withArgs(arg).to.throwException(new RegExp(page.error.missingArgNewFiles));
					done();
				});
			});
			it('should pass', function (done) {
				var arg1 = {
						"destinationRootPath": "test/fixture/",
						"sourceFolderPath": 'test/fixture/',
						"currentFiles": ["renamable.txt"],
						"newFiles": ["warning-mocha-test-failed-during-rename.txt"],
						"folderName": ""
					},
					arg2,
					fs = require('fs');
				arg2 = JSON.parse(JSON.stringify(arg1)); // clone
				arg2.sourceFolderPath = arg1.sourceFolderPath;
				arg2.currentFiles = arg1.newFiles;
				arg2.newFiles = arg1.currentFiles;
				
				page.movePhotos(arg1, function () {
					var filename1 = arg1.destinationRootPath + arg1.newFiles[0];
						expect(fs.existsSync(filename1).toString() + "-first").to.be("true-first");

					page.movePhotos(arg2, function () {
						var filename2 = arg2.destinationRootPath + arg2.newFiles[0];
						expect(fs.existsSync(filename2).toString() + "-second").to.be("true-second");
						done();
					});
				});
			});
		});
		describe('preview()', function () {
			it('should fail without argument', function (done) {
				var arg;
				expect(page.preview).withArgs(arg).to.throwException(function (exception) { // get the exception object
					expect(exception).to.be.a(ReferenceError);
					expect(page.preview).withArgs(arg).to.throwException(new RegExp(page.error.missingArg));
					done();
				});
			});
			it('should fail without constant argument', function (done) {
				var arg = {
					"isTest": true
				};
				expect(page.preview).withArgs(arg).to.throwException(function (exception) { // get the exception object
					expect(exception).to.be.a(ReferenceError);
					expect(page.preview).withArgs(arg).to.throwException(new RegExp(page.error.missingArgConstant));
					done();
				});
			});
			it('should fail without response argument', function (done) {
				var arg = {
					"constant": {

					},
					"isTest": true
				};
				expect(page.preview).withArgs(arg).to.throwException(function (exception) { // get the exception object
					expect(exception).to.be.a(ReferenceError);
					expect(page.preview).withArgs(arg).to.throwException(new RegExp(page.error.missingArgResponse));
					done();
				});
			});
			it('should fail without request argument', function (done) {
				var arg = {
					"constant": {},
					"isTest": true,
					"response": {}
				};
				expect(page.preview).withArgs(arg).to.throwException(function (exception) { // get the exception object
					expect(exception).to.be.a(ReferenceError);
					expect(page.preview).withArgs(arg).to.throwException(new RegExp(page.error.missingArgRequest));
					done();
				});
			});
			it('should fail without folder in request argument', function (done) {
				var arg = {
					"constant": {},
					"isTest": true,
					"response": {},
					"request": {}
				};
				expect(page.preview).withArgs(arg).to.throwException(function (exception) { // get the exception object
					expect(exception).to.be.a(ReferenceError);
					expect(page.preview).withArgs(arg).to.throwException(new RegExp(page.error.missingArgRequestBodyFolder));
					done();
				});
			});
			it('should fail with invalid folder', function (done) {
				var arg;
				arg = {
					"constant": {},
					"isTest": true,
					"response": {},
					"request": {
						"body": {
							"folder": "test/fixture/fake/"
						}
					}
				};
				expect(page.preview).withArgs(arg).to.throwException(function (exception) { // get the exception object
					expect(exception).to.be("Path does not exist: ./" + arg.request.body.folder);
					done();
				});
			});
			it('should verify test folders', function (done) {
				var arg;
				arg = {
					"constant": {
						"debug": false
					},
					"isTest": true,
					"response": {
						"end": function (outJSON) {
							expect(outJSON).to.be('{"thumbnails":["g3.gif","j1.jpeg","p2.png"]}');
							done();
						},
						"writeHead": function (okay) {
							expect(okay).to.be(200);
						}
					},
					"request": {
						"body": {
							"folder": "test/fixture/image/"
						}
					}
				};
				page.preview(arg);
			});
		});
	});
});
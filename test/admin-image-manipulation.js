/*global __dirname, console, describe, it, require*/
var expect = require("expect.js");

describe('Admin:', function () {
	describe('Image manipulation:', function () {
		var page = require("../js/admin-image-manipulation.js");
		describe('ensureDestinationFolder()', function () {
			it('should fail without argument (a1)', function (done) {
				var arg;
				expect(page.ensureDestinationFolder).withArgs(arg).to.throwException(function (exception) { // get the exception object
					expect(exception).to.be.a(ReferenceError);
					expect(page.ensureDestinationFolder).withArgs(arg).to.throwException(new RegExp(page.error.missingArg));
					done();
				});
			});
			it('should fail without constant argument (a2)', function (done) {
				var arg = {};
				expect(page.ensureDestinationFolder).withArgs(arg).to.throwException(function (exception) { // get the exception object
					expect(exception).to.be.a(ReferenceError);
					expect(page.ensureDestinationFolder).withArgs(arg).to.throwException(new RegExp(page.error.missingArgConstant));
					done();
				});
			});
			it('should fail without resize folder in constant argument (a3)', function (done) {
				var arg = {
					"constant": {}
				};
				expect(page.ensureDestinationFolder).withArgs(arg).to.throwException(function (exception) { // get the exception object
					expect(exception).to.be.a(ReferenceError);
					expect(page.ensureDestinationFolder).withArgs(arg).to.throwException(new RegExp(page.error.missingArgConstantResizeFolder));
					done();
				});
			});
			it('should fail without prefix argument (a4)', function (done) {
				var arg = {
					"constant": {
						"resizeFolder": "test"
					}
				};
				expect(page.ensureDestinationFolder).withArgs(arg).to.throwException(function (exception) { // get the exception object
					expect(exception).to.be.a(ReferenceError);
					expect(page.ensureDestinationFolder).withArgs(arg).to.throwException(new RegExp(page.error.missingArgFolderName));
					done();
				});
			});
			it('should verify test folders (a5)', function (done) {
				var arg,
					fs = require('fs'),
					testFolder = "/test/fixture/galleries/",
					verifiedPaths;
				arg = {
					"constant": {
						"resizeFolder": "test"
					},
					"targetFolderName": 'testAlbum',
					"destinationRootPath": require('path').dirname(__dirname) + testFolder
				};
				verifiedPaths = page.ensureDestinationFolder(arg);
				expect(verifiedPaths).to.be.an('array');
				expect(verifiedPaths[0]).to.contain(testFolder + 'originals/' + arg.targetFolderName);
				expect(verifiedPaths[1]).to.contain(testFolder + 'photos/' + arg.targetFolderName);
				expect(verifiedPaths[2]).to.contain(testFolder + 'thumbs/' + arg.targetFolderName);
				expect(fs.existsSync(verifiedPaths[0])).to.be(true);
				expect(fs.existsSync(verifiedPaths[1])).to.be(true);
				expect(fs.existsSync(verifiedPaths[2])).to.be(true);
				done();
			});
		});
		describe('movePhotos()', function () {
			it('should fail without argument (b1)', function (done) {
				var arg;
				expect(page.movePhotos).withArgs(arg).to.throwException(function (exception) { // get the exception object
					expect(exception).to.be.a(ReferenceError);
					expect(page.movePhotos).withArgs(arg).to.throwException(new RegExp(page.error.missingArg));
					done();
				});
			});
			it('should fail without sourceFolderPath argument (b2)', function (done) {
				var arg = {};
				expect(page.movePhotos).withArgs(arg).to.throwException(function (exception) { // get the exception object
					expect(exception).to.be.a(ReferenceError);
					expect(page.movePhotos).withArgs(arg).to.throwException(new RegExp(page.error.missingArgSourcePath));
					done();
				});
			});
			it('should fail without folder name argument (b3)', function (done) {
				var arg = {"sourceFolderPath": ''};
				expect(page.movePhotos).withArgs(arg).to.throwException(function (exception) { // get the exception object
					expect(exception).to.be.a(ReferenceError);
					expect(page.movePhotos).withArgs(arg).to.throwException(new RegExp(page.error.missingArgFolderName));
					done();
				});
			});
			it('should fail without currentFiles argument (b4)', function (done) {
				var arg = {"sourceFolderPath": '',"targetFolderName": ""};
				expect(page.movePhotos).withArgs(arg).to.throwException(function (exception) { // get the exception object
					expect(exception).to.be.a(ReferenceError);
					expect(page.movePhotos).withArgs(arg).to.throwException(new RegExp(page.error.missingArgCurrentFiles));
					done();
				});
			});
			it('should fail without moveToResize argument (b5)', function (done) {
				var arg = {"sourceFolderPath": '', "currentFiles": ["j1.jpeg"], "targetFolderName": ""};
				expect(page.movePhotos).withArgs(arg).to.throwException(function (exception) { // get the exception object
					expect(exception).to.be.a(ReferenceError);
					expect(page.movePhotos).withArgs(arg).to.throwException(new RegExp(page.error.missingArgMove));
					done();
				});
			});
			it('should fail without constant argument (b6)', function (done) {
				var arg = {"sourceFolderPath": '', "currentFiles": ["j1.jpeg"], "targetFolderName": "", "moveToResize": true};
				expect(page.movePhotos).withArgs(arg).to.throwException(function (exception) { // get the exception object
					expect(exception).to.be.a(ReferenceError);
					expect(page.movePhotos).withArgs(arg).to.throwException(new RegExp(page.error.missingArgConstant));
					done();
				});
			});
			it('should fail without newFiles argument (b7)', function (done) {
				var arg = {"sourceFolderPath": '', "currentFiles": ["j1.jpeg"], "targetFolderName": "", "moveToResize": true, "constant": {}};
				expect(page.movePhotos).withArgs(arg).to.throwException(function (exception) { // get the exception object
					expect(exception).to.be.a(ReferenceError);
					expect(page.movePhotos).withArgs(arg).to.throwException(new RegExp(page.error.missingArgNewFiles));
					done();
				});
			});
			it('should pass by moving files (b8)', function (done) {
				var arg1 = {
						"constant": {},
						"destinationRootPath": "test/fixture/",
						"sourceFolderPath": 'test/fixture/',
						"currentFiles": ["renamable.txt"],
						"moveToResize": true,
						"newFiles": ["warning-mocha-test-failed-during-rename.txt"],
						"targetFolderName": ""
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
			it('should pass by renaming files (b9)', function (done) {
				var arg1 = {
						"constant": {},
						"destinationRootPath": "test/fixture/",
						"sourceFolderPath": 'test/fixture/',
						"currentFiles": ["renamable.txt"],
						"moveToResize": false,
						"newFiles": ["warning-mocha-test-failed-during-rename.txt"],
						"targetFolderName": ""
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
			it('should fail without argument (c1)', function (done) {
				var arg;
				expect(page.preview).withArgs(arg).to.throwException(function (exception) { // get the exception object
					expect(exception).to.be.a(ReferenceError);
					expect(page.preview).withArgs(arg).to.throwException(new RegExp(page.error.missingArg));
					done();
				});
			});
			it('should fail without constant argument (c2)', function (done) {
				var arg = {
					"isTest": true
				};
				expect(page.preview).withArgs(arg).to.throwException(function (exception) { // get the exception object
					expect(exception).to.be.a(ReferenceError);
					expect(page.preview).withArgs(arg).to.throwException(new RegExp(page.error.missingArgConstant));
					done();
				});
			});
			it('should fail without response argument (c3)', function (done) {
				var arg = {
					"constant": {},
					"isTest": true
				};
				expect(page.preview).withArgs(arg).to.throwException(function (exception) { // get the exception object
					expect(exception).to.be.a(ReferenceError);
					expect(page.preview).withArgs(arg).to.throwException(new RegExp(page.error.missingArgResponse));
					done();
				});
			});
			it('should fail without request argument (c4)', function (done) {
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
			it('should fail without folder in request argument (c5)', function (done) {
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
			it('should fail with invalid folder (c6)', function (done) {
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
			it('should verify test folders (c7)', function (done) {
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
		
		describe('rename()', function () {
			it('should fail without argument (d1)', function (done) {
				var arg;
				expect(page.rename).withArgs(arg).to.throwException(function (exception) { // get the exception object
					expect(exception).to.be.a(ReferenceError);
					expect(page.rename).withArgs(arg).to.throwException(new RegExp(page.error.missingArg));
					done();
				});
			});
			it('should fail without constant argument (d2)', function (done) {
				var arg = {
					"isTest": true
				};
				expect(page.rename).withArgs(arg).to.throwException(function (exception) { // get the exception object
					expect(exception).to.be.a(ReferenceError);
					expect(page.rename).withArgs(arg).to.throwException(new RegExp(page.error.missingArgConstant));
					done();
				});
			});
			it('should fail without response argument (d3)', function (done) {
				var arg = {
					"constant": {

					},
					"isTest": true
				};
				expect(page.rename).withArgs(arg).to.throwException(function (exception) { // get the exception object
					expect(exception).to.be.a(ReferenceError);
					expect(page.rename).withArgs(arg).to.throwException(new RegExp(page.error.missingArgResponse));
					done();
				});
			});
			it('should fail without request argument (d4)', function (done) {
				var arg = {
					"constant": {},
					"isTest": true,
					"response": {}
				};
				expect(page.rename).withArgs(arg).to.throwException(function (exception) { // get the exception object
					expect(exception).to.be.a(ReferenceError);
					expect(page.rename).withArgs(arg).to.throwException(new RegExp(page.error.missingArgRequest));
					done();
				});
			});
			it('should fail without folder in request argument (d5)', function (done) {
				var arg = {
					"constant": {},
					"isTest": true,
					"response": {},
					"request": {}
				};
				expect(page.rename).withArgs(arg).to.throwException(function (exception) { // get the exception object
					expect(exception).to.be.a(ReferenceError);
					expect(page.rename).withArgs(arg).to.throwException(new RegExp(page.error.missingArgFolderName));
					done();
				});
			});
			it('should fail without sourceFolderPath argument (d6)', function (done) {
				var arg = {
					"constant": {},
					"isTest": true,
					"response": {},
					"request": {
						"body": {
							"targetFolderName": ""
						}
					}
				};
				expect(page.rename).withArgs(arg).to.throwException(function (exception) { // get the exception object
					expect(exception).to.be.a(ReferenceError);
					expect(page.rename).withArgs(arg).to.throwException(new RegExp(page.error.missingArgSourcePath));
					done();
				});
			});
			it('should fail without currentFiles argument (d7)', function (done) {
				var arg = {
					"constant": {},
					"isTest": true,
					"response": {},
					"request": {
						"body": {
							"targetFolderName": "",
							"sourceFolderPath": ""
						}
					}
				};
				expect(page.rename).withArgs(arg).to.throwException(function (exception) { // get the exception object
					expect(exception).to.be.a(ReferenceError);
					expect(page.rename).withArgs(arg).to.throwException(new RegExp(page.error.missingArgCurrentFiles));
					done();
				});
			});
			it('should fail without moveToResize argument (d8)', function (done) {
				var arg = {
					"constant": {},
					"isTest": true,
					"response": {},
					"request": {
						"body": {
							"targetFolderName": "",
							"sourceFolderPath": "",
							"currentFiles": ["fake"]
						}
					}
				};
				expect(page.rename).withArgs(arg).to.throwException(function (exception) { // get the exception object
					expect(exception).to.be.a(ReferenceError);
					expect(page.rename).withArgs(arg).to.throwException(new RegExp(page.error.missingArgMove));
					done();
				});
			});
			it('should fail without newFiles argument (d9)', function (done) {
				var arg = {
					"constant": {},
					"isTest": true,
					"response": {},
					"request": {
						"body": {
							"targetFolderName": "",
							"sourceFolderPath": "",
							"currentFiles": ["fake"],
							"moveToResize": false
						}
					}
				};
				expect(page.rename).withArgs(arg).to.throwException(function (exception) { // get the exception object
					expect(exception).to.be.a(ReferenceError);
					expect(page.rename).withArgs(arg).to.throwException(new RegExp(page.error.missingArgNewFiles));
					done();
				});
			});
			it('should pass by renaming (d10)', function (done) {
				var arg = {
					"constant": {},
					"isTest": true,
					"response": {},
					"request": {
						"body": {
							"targetFolderName": "",
							"sourceFolderPath": "",
							"currentFiles": ["fake"],
							"moveToResize": false,
							"newFiles": ["fake"]
						}
					}
				};
				expect(page.rename(arg)).to.be("tested");
				done();
			});
		});
	});
});
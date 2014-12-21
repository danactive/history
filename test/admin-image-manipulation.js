/*global __dirname, console, describe, it, require*/
var constant = require("../js/global-constant.js"),
	expect = require("expect.js"),
	fs = require('fs'),
	path = require("path");

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
			it('should fail without resize folder in constant argument (a3)', function (done) {
				var arg = {
				};
				expect(page.ensureDestinationFolder).withArgs(arg).to.throwException(function (exception) { // get the exception object
					expect(exception).to.be.a(ReferenceError);
					expect(page.ensureDestinationFolder).withArgs(arg).to.throwException(new RegExp(page.error.missingArgConstantResizeFolder));
					done();
				});
			});
			it('should fail without prefix argument (a4)', function (done) {
				var arg = {
				};
				expect(page.ensureDestinationFolder).withArgs(arg).to.throwException(function (exception) { // get the exception object
					expect(exception).to.be.a(ReferenceError);
					expect(page.ensureDestinationFolder).withArgs(arg).to.throwException(new RegExp(page.error.missingArgFolderName));
					done();
				});
			});
			it('should verify test folders (a5)', function (done) {
				var arg,
					testFolder = "/test/fixture/galleries/",
					verifiedPaths;
				arg = {
					"targetFolderName": 'testAlbum',
					"destinationRootPath": path.dirname(__dirname) + testFolder
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
		/***
		*     #     #                         ######                                    
		*     ##   ##  ####  #    # ######    #     # #    #  ####  #####  ####   ####  
		*     # # # # #    # #    # #         #     # #    # #    #   #   #    # #      
		*     #  #  # #    # #    # #####     ######  ###### #    #   #   #    #  ####  
		*     #     # #    # #    # #         #       #    # #    #   #   #    #      # 
		*     #     # #    #  #  #  #         #       #    # #    #   #   #    # #    # 
		*     #     #  ####    ##   ######    #       #    #  ####    #    ####   ####  
		*                                                                               
		*/
		describe('movePhotos()', function () {
			var arg,
				expectError = function (done, errorMessage) {
					expect(page.movePhotos).withArgs(arg).to.throwException(function (exception) { // get the exception object
						expect(exception).to.be.a(ReferenceError);
						expect(page.movePhotos).withArgs(arg).to.throwException(page.error[errorMessage]);
						done();
					});
				};

			it('should fail without argument (b1)', function (done) {
				expectError(done, "missingArg");
			});
			it('should fail without assets argument (b2)', function (done) {
				arg = {};
				expectError(done, "missingArgAssets");
			});
			it('should fail without moveToResize argument (b3)', function (done) {
				arg.assets = {
					"sort": ["renamable"],
					"renamable": {
						"files": [{
							"raw": path.dirname(__dirname) + "\\test\\fixture\\image\\j1.jpeg",
							"moved": "\\renamed.jpeg"
						}]
					}
				};
				arg.destinationRootPath = path.dirname(__dirname) + "\\test\\fixture\\childless";
				expectError(done, "missingArgMove");
			});
			it('should pass by moving files (b4)', function (done) {
				var verifyPath = arg.destinationRootPath + arg.assets.renamable.files[0].moved;
				arg.moveToResize = true;

				if (constant.config.debug === true) {
					console.log("movePhotos b4:" + verifyPath);
				}

				page.movePhotos(arg, function () {
					expect(fs.existsSync(verifyPath)).to.be(true);
					done();
				});
			});
			it('should pass by move restoring files (b5)', function (done) {
				var verifyPath;
				arg.moveToResize = true;
				arg.assets.renamable = {
					"files": [{
						"raw": path.dirname(__dirname) + "\\test\\fixture\\childless\\renamed.jpeg",
						"moved": "\\j1.jpeg"
					}]
				};
				arg.destinationRootPath = path.dirname(__dirname) + "\\test\\fixture\\image";
				verifyPath = arg.destinationRootPath + arg.assets.renamable.files[0].moved;

				if (constant.config.debug === true) {
					console.log("movePhotos b5:" + verifyPath);
					console.log("movePhotos b5:" + arg);
				}

				page.movePhotos(arg, function () {
					expect(fs.existsSync(verifyPath)).to.be(true);
					done();
				});
			});
		});
		/***
		*     ######                                       
		*     #     # #####  ###### #    # # ###### #    # 
		*     #     # #    # #      #    # # #      #    # 
		*     ######  #    # #####  #    # # #####  #    # 
		*     #       #####  #      #    # # #      # ## # 
		*     #       #   #  #       #  #  # #      ##  ## 
		*     #       #    # ######   ##   # ###### #    # 
		*                                                  
		*/
		describe('preview()', function () {
			var arg,
				expectError = function (done, errorMessage) {
					expect(page.preview).withArgs(arg).to.throwException(function (exception) { // get the exception object
						expect(exception).to.be.a(ReferenceError);
						expect(page.preview).withArgs(arg).to.throwException(new RegExp(page.error[errorMessage]));
						done();
					});
				};
			it('should fail without argument (c1)', function (done) {
				expectError(done, "missingArg");
			});
			it('should fail without response argument (c3)', function (done) {
				arg = {};
				expectError(done, "missingArgResponse");
			});
			it('should fail without request argument (c4)', function (done) {
				arg.response = {};
				expectError(done, "missingArgRequest");
			});
			it('should fail without folder in request argument (c5)', function (done) {
				arg.request = {};
				expectError(done, "missingArgRequestBodyFolder");
			});
			it('should fail with invalid folder (c6)', function (done) {
				arg.request.body = {
					"folder": "test/fixture/fake/"
				};
				expect(page.preview).withArgs(arg).to.throwException(function (exception) { // get the exception object
					expect(exception).to.be("Path does not exist: ./" + arg.request.body.folder);
					done();
				});
			});
			it('should verify test folders (c7)', function (done) {
				arg.response = {
					"end": function (payload) {
						expect(payload).to.be('{"thumbnails":["' + constant.config.tempThumbFolder + "/" + 'g3.gif","' + constant.config.tempThumbFolder + "/" + 'j1.jpeg","' + constant.config.tempThumbFolder + "/" + 'p2.png"]}');
						done();
					},
					"writeHead": function (okay) {
						expect(okay).to.be(200);
					}
				};
				arg.request = {
					"body": {
						"folder": "test/fixture/image/"
					}
				};
				page.preview(arg);
			});
		});
		/***
		*     ######                                       ######                      
		*     #     # ###### #      ###### ##### ######    #     #   ##   ##### #    # 
		*     #     # #      #      #        #   #         #     #  #  #    #   #    # 
		*     #     # #####  #      #####    #   #####     ######  #    #   #   ###### 
		*     #     # #      #      #        #   #         #       ######   #   #    # 
		*     #     # #      #      #        #   #         #       #    #   #   #    # 
		*     ######  ###### ###### ######   #   ######    #       #    #   #   #    # 
		*                                                                              
		*/
		describe('deletePath()', function () {
			var arg,
				expectError = function (done, errorMessage) {
					expect(page.deletePath).withArgs(arg).to.throwException(function (exception) { // get the exception object
						expect(exception).to.be.a(ReferenceError);
						expect(page.deletePath).withArgs(arg).to.throwException(new RegExp(page.error[errorMessage]));
						done();
					});
				};
			it('should fail without argument (e1)', function (done) {
				expectError(done, "missingArg");
			});
			it('should fail without a path (e2)', function (done) {
				arg = {};
				expectError(done, "missingArgTargetPath");
			});
			it('should fail without request argument (e3)', function (done) {
				arg.request = {
					"body": {}
				};
				expectError(done, "missingArgTargetPath");
			});
			it('should pass (e4)', function (done) {
				var verifyPath;
				arg.request.body.tempThumbFolder = "\\test\\fixture\\image";
				verifyPath = path.join(path.dirname(__dirname), arg.request.body.tempThumbFolder, constant.config.tempThumbFolder);

				if (constant.config.debug === true) {
					console.log("deletePath e4:" + verifyPath);
				}

				arg.response = {
					"end": function (payload) {
						expect(payload).to.contain(JSON.stringify({"message": verifyPath + " folder successfully deleted."}));
					},
					"writeHead": function (okay) {
						expect(okay).to.be(200);
					}
				};

				page.deletePath(arg, function () {
					expect(fs.existsSync(verifyPath)).to.be(false);
					done();
				});
			});
		});
		/***
		*     ######                                     
		*     #     # ###### #    #   ##   #    # ###### 
		*     #     # #      ##   #  #  #  ##  ## #      
		*     ######  #####  # #  # #    # # ## # #####  
		*     #   #   #      #  # # ###### #    # #      
		*     #    #  #      #   ## #    # #    # #      
		*     #     # ###### #    # #    # #    # ###### 
		*                                                
		*/
		describe('rename()', function () {
			var arg,
				expectError = function (done, errorMessage) {
					expect(page.rename).withArgs(arg).to.throwException(function (exception) { // get the exception object
						expect(exception).to.be.a(ReferenceError);
						expect(page.rename).withArgs(arg).to.throwException(new RegExp(page.error[errorMessage]));
						done();
					});
				};
			it('should fail without argument (d1)', function (done) {
				expectError(done, "missingArg");
			});
			it('should fail without response argument (d3)', function (done) {
				arg = {};
				expectError(done, "missingArgResponse");
			});
			it('should fail without request argument (d4)', function (done) {
				arg.response = {};
				expectError(done, "missingArgRequest");
			});
			it('should fail without assets in request argument (d5)', function (done) {
				arg.request = {};
				expectError(done, "missingArgAssets");
			});
			it('should fail without move or rename in request argument (d6)', function (done) {
				arg.request.body = {};
				arg.request.body.assets = {
					"sort": ["renamable"],
					"renamable": {
						"files": [{
							"raw": path.dirname(__dirname) + "\\test\\fixture\\renamable.txt",
							"renamed": path.dirname(__dirname) + "\\test\\fixture\\warning-mocha-test-failed-during-rename.txt"
						}]
					}
				};
				expectError(done, "missingArgMove");
			});
			it('should pass by renaming (d7)', function (done) {
				arg.request.body.moveToResize = false;

				page.rename(arg, function (result) {
					expect(result.assets[0].destination.value).to.be(arg.request.body.assets.renamable.files.renamed);
					done();
				});
			});
			it('should pass by restoring filename (d8)', function (done) {
				var tempName = arg.request.body.assets.renamable.files[0].raw;
				arg.request.body.assets.renamable.files[0].raw = arg.request.body.assets.renamable.files[0].renamed;
				arg.request.body.assets.renamable.files[0].renamed = tempName;

				page.rename(arg, function (result) {
					expect(result.assets[0].destination.value).to.be(arg.request.body.assets.renamable.files.renamed);
					done();
				});
			});
		});
	});
});
/*global __dirname, console, describe, it, require*/
var appRoot = require('app-root-path'),
	boom = require("boom"),
	constant = require(appRoot + "/src/js/global-constant.js"),
	debugMsg,
	expect = require("expect.js"),
	fs = require('fs'),
	path = require("path");
debugMsg = function (msg) {
	if (constant.config.debug && constant.config.debug === true) {
		console.log(msg);
	}
};


describe('Admin:', function () {
	describe('Image manipulation:', function () {
		var page = require(appRoot + "/src/js/image_manipulation.js");
		/***
		*     #######
		*     #       #    #  ####  #    # #####  ######
		*     #       ##   # #      #    # #    # #
		*     #####   # #  #  ####  #    # #    # #####
		*     #       #  # #      # #    # #####  #
		*     #       #   ## #    # #    # #   #  #
		*     ####### #    #  ####   ####  #    # ######
		*
		*/
		describe('ensureDestinationFolder()', function () {
			var arg = {};
			it('should verify global ' + constant.config.resizeFolder + ' folder (a1)', function (done) {
				var testFolder = constant.config.resizeFolder,
					verifiedPaths;
				arg.targetFolderName = 'testAlbum';

				page.ensureDestinationFolder(arg, function (err, verifiedPaths) {
					if (err) {
						return done(err);
					}
					expect(verifiedPaths).to.be.an('array');
					expect(verifiedPaths[0].split(path.sep)).to.eql(path.join(appRoot.path, testFolder, 'originals', arg.targetFolderName).split(path.sep));
					expect(verifiedPaths[1].split(path.sep)).to.eql(path.join(appRoot.path, testFolder, 'photos', arg.targetFolderName).split(path.sep));
					expect(verifiedPaths[2].split(path.sep)).to.eql(path.join(appRoot.path, testFolder, 'thumbs', arg.targetFolderName).split(path.sep));
					expect(fs.existsSync(verifiedPaths[0])).to.be(true);
					expect(fs.existsSync(verifiedPaths[1])).to.be(true);
					expect(fs.existsSync(verifiedPaths[2])).to.be(true);
					return done();
				});
			});
			it('should verify test folders (a2)', function (done) {
				var testFolder = "test/fixture/galleries",
					verifiedPaths;
				arg.destinationRootPath = path.join(appRoot.path, testFolder);

				// copied from a1
				page.ensureDestinationFolder(arg, function (err, verifiedPaths) {
					if (err) {
						return done(err);
					}
					expect(verifiedPaths).to.be.an('array');
					expect(verifiedPaths[0].split(path.sep)).to.eql(path.join(appRoot.path, testFolder, 'originals', arg.targetFolderName).split(path.sep));
					expect(verifiedPaths[1].split(path.sep)).to.eql(path.join(appRoot.path, testFolder, 'photos', arg.targetFolderName).split(path.sep));
					expect(verifiedPaths[2].split(path.sep)).to.eql(path.join(appRoot.path, testFolder, 'thumbs', arg.targetFolderName).split(path.sep));
					expect(fs.existsSync(verifiedPaths[0])).to.be(true);
					expect(fs.existsSync(verifiedPaths[1])).to.be(true);
					expect(fs.existsSync(verifiedPaths[2])).to.be(true);
					return done();
				});
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
			var arg = {};
			arg.assets = { "sort": ["1900-01-02"] };
			arg.assets["1900-01-02"] = {
				"files": [{
					"raw": "/src/test/fixture/image/j1.jpeg",
					"moved": "renamed.jpeg"
				}]
			};
			arg.destinationRootPath = "/src/test/fixture/childless";

			it('should fail with missing arguments (b0)', function (done) {
				var incompleteArg = {
						assets: { "sort": ["need_match_key"] }
					};

				expect(page.movePhotos).withArgs(incompleteArg).to.throwException(function (exception) { // get the exception object
					expect(exception).to.be.a(ReferenceError);
					done();
				});
			});
			it('should pass by moving files (b1)', function (done) {
				var verifyPath = path.join(appRoot.path, arg.destinationRootPath, arg.assets["1900-01-02"].files[0].moved);
				arg.moveToResize = true;

				debugMsg("movePhotos b1:" + verifyPath);

				page.movePhotos(arg, function (err, assets) {
					if (err) {
						return done(err);
					}
					expect(fs.existsSync(verifyPath)).to.be(true);
					return done();
				});
			});
			it('should pass by move restoring files (b2)', function (done) {
				var verifyPath;
				arg.moveToResize = true;
				arg.assets["1900-01-02"] = {
					"files": [{
						"raw": "/src/test/fixture/childless/renamed.jpeg",
						"moved": "j1.jpeg"
					}]
				};
				arg.destinationRootPath = "/src/test/fixture/image";
				verifyPath = path.join(appRoot.path, arg.destinationRootPath, arg.assets["1900-01-02"].files[0].moved);

				if (constant.config.debug === true) {
					console.log("movePhotos b2:" + arg.destinationRootPath);
					console.log("movePhotos b2:" + verifyPath);
				}

				page.movePhotos(arg, function (err, assets) {
					if (err) {
						return done(err);
					}
					expect(fs.existsSync(verifyPath)).to.be(true);
					return done();
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
		// describe('preview()', function () {
		// 	var arg,
		// 		expectError = function (done, errorMessage) {
		// 			expect(page.preview).withArgs(arg).to.throwException(function (exception) { // get the exception object
		// 				expect(exception).to.be.a(ReferenceError);
		// 				expect(page.preview).withArgs(arg).to.throwException(new RegExp(page.error[errorMessage]));
		// 				done();
		// 			});
		// 		};
		// 	it('should fail without argument (c1)', function (done) {
		// 		expectError(done, "missingArg");
		// 	});
		// 	it('should fail without response argument (c3)', function (done) {
		// 		arg = {};
		// 		expectError(done, "missingArgResponse");
		// 	});
		// 	it('should fail without request argument (c4)', function (done) {
		// 		arg.response = {};
		// 		expectError(done, "missingArgRequest");
		// 	});
		// 	it('should fail without folder in request argument (c5)', function (done) {
		// 		arg.request = {};
		// 		expectError(done, "missingArgRequestBodyFolder");
		// 	});
		// 	it('should fail with invalid folder (c6)', function (done) {
		// 		arg.request.body = {
		// 			"folder": "test/fixture/fake/"
		// 		};
		// 		expect(page.preview).withArgs(arg).to.throwException(function (exception) { // get the exception object
		// 			expect(exception).to.be("Path does not exist: ./" + arg.request.body.folder);
		// 			done();
		// 		});
		// 	});
		// 	it('should verify test folders (c7)', function (done) {
		// 		arg.response = {
		// 			"end": function (payload) {
		// 				expect(payload).to.be('{"thumbnails":["' + constant.config.tempThumbFolder + "/" + 'g3.gif","' + constant.config.tempThumbFolder + "/" + 'j1.jpeg","' + constant.config.tempThumbFolder + "/" + 'p2.png"]}');
		// 				done();
		// 			},
		// 			"writeHead": function (okay) {
		// 				expect(okay).to.be(200);
		// 			}
		// 		};
		// 		arg.request = {
		// 			"body": {
		// 				"folder": "test/fixture/image/"
		// 			}
		// 		};
		// 		page.preview(arg);
		// 	});
		// });
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
		// describe('deletePath()', function () {
		// 	var arg,
		// 		expectError = function (done, errorMessage) {
		// 			expect(page.deletePath).withArgs(arg).to.throwException(function (exception) { // get the exception object
		// 				expect(exception).to.be.a(ReferenceError);
		// 				expect(page.deletePath).withArgs(arg).to.throwException(new RegExp(page.error[errorMessage]));
		// 				done();
		// 			});
		// 		};
		// 	it('should fail without argument (e1)', function (done) {
		// 		expectError(done, "missingArg");
		// 	});
		// 	it('should fail without a path (e2)', function (done) {
		// 		arg = {};
		// 		expectError(done, "missingArgTargetPath");
		// 	});
		// 	it('should fail without request argument (e3)', function (done) {
		// 		arg.request = {
		// 			"body": {}
		// 		};
		// 		expectError(done, "missingArgTargetPath");
		// 	});
		// 	it('should pass (e4)', function (done) {
		// 		var verifyPath;
		// 		arg.request.body.tempThumbFolder = "/test/fixture/image";
		// 		verifyPath = path.join(path.dirname(__dirname), arg.request.body.tempThumbFolder, constant.config.tempThumbFolder);

		// 		if (constant.config.debug === true) {
		// 			console.log("deletePath e4:" + verifyPath);
		// 		}

		// 		arg.response = {
		// 			"end": function (payload) {
		// 				expect(payload).to.contain(JSON.stringify({"message": verifyPath + " folder successfully deleted."}));
		// 			},
		// 			"writeHead": function (okay) {
		// 				expect(okay).to.be(200);
		// 			}
		// 		};

		// 		page.deletePath(arg, function () {
		// 			expect(fs.existsSync(verifyPath)).to.be(false);
		// 			done();
		// 		});
		// 	});
		// });
	});
});

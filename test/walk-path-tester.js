/*global console, describe, it, require*/
var expect = require("expect.js");

describe('Admin:', function () {
	describe('Resize & rename photos:', function () {
		var page = require("../js/walk-path-tested.js");
		describe('getRenamedFiles()', function () {
			it('should fail without argument', function (done) {
				var arg;
				expect(page.getRenamedFiles).withArgs(arg).to.throwException(function (exception) { // get the exception object
					expect(exception).to.be.a(ReferenceError);
					expect(page.getRenamedFiles).withArgs(arg).to.throwException(new RegExp(page.error.missingArg));
					done();
				});
			});
			it('should fail without prefix argument', function (done) {
				var arg = {};
				expect(page.getRenamedFiles).withArgs(arg).to.throwException(function (exception) { // get the exception object
					expect(exception).to.be.a(ReferenceError);
					expect(page.getRenamedFiles).withArgs(arg).to.throwException(new RegExp(page.error.missingArgPrefix));
					done();
				});
			});
			it('should fail without day count argument', function (done) {
				var arg = {"filePrefix": ""};
				expect(page.getRenamedFiles).withArgs(arg).to.throwException(function (exception) { // get the exception object
					expect(exception).to.be.a(ReferenceError);
					expect(page.getRenamedFiles).withArgs(arg).to.throwException(new RegExp(page.error.missingArgDayCount));
					done();
				});
			});
			it('should return an array of renamed files with a photo count of 1', function (done) {
				var arg = {"filePrefix": 'photo_prefix', "photosInDay": 1},
					renamedFiles = page.getRenamedFiles(arg).files;
				expect(renamedFiles).to.be.an('array');
				expect(renamedFiles.length).to.be(arg.photosInDay);
				expect(renamedFiles[0]).to.be(arg.filePrefix + "-50");
				done();
			});
			it('should return an array of renamed files with a photo count of 2', function (done) {
				var arg = {"filePrefix": 'photo_prefix', "photosInDay": 2},
					renamedFiles = page.getRenamedFiles(arg).files;
				expect(renamedFiles).to.be.an('array');
				expect(renamedFiles.length).to.be(arg.photosInDay);
				expect(renamedFiles[0]).to.be(arg.filePrefix + "-50");
				expect(renamedFiles[1]).to.be(arg.filePrefix + "-90");
				done();
			});
			it('should return an array of renamed files with a photo count of 3', function (done) {
				var arg = {"filePrefix": 'photo_prefix', "photosInDay": 3},
					renamedFiles = page.getRenamedFiles(arg).files;
				expect(renamedFiles).to.be.an('array');
				expect(renamedFiles.length).to.be(arg.photosInDay);
				expect(renamedFiles[0]).to.be(arg.filePrefix + "-37");
				expect(renamedFiles[1]).to.be(arg.filePrefix + "-64");
				expect(renamedFiles[2]).to.be(arg.filePrefix + "-90");
				done();
			});
			it('should return an array of renamed files with a photo count of 4', function (done) {
				var arg = {"filePrefix": 'photo_prefix', "photosInDay": 4},
					renamedFiles = page.getRenamedFiles(arg).files;
				expect(renamedFiles).to.be.an('array');
				expect(renamedFiles.length).to.be(arg.photosInDay);
				expect(renamedFiles[0]).to.be(arg.filePrefix + "-30");
				expect(renamedFiles[1]).to.be(arg.filePrefix + "-50");
				expect(renamedFiles[2]).to.be(arg.filePrefix + "-70");
				expect(renamedFiles[3]).to.be(arg.filePrefix + "-90");
				done();
			});
			it('should return an array of renamed files with a photo count of 5', function (done) {
				var arg = {"filePrefix": 'photo_prefix', "photosInDay": 5},
					renamedFiles = page.getRenamedFiles(arg).files;
				expect(renamedFiles).to.be.an('array');
				expect(renamedFiles.length).to.be(arg.photosInDay);
				expect(renamedFiles[0]).to.be(arg.filePrefix + "-26");
				expect(renamedFiles[1]).to.be(arg.filePrefix + "-42");
				expect(renamedFiles[2]).to.be(arg.filePrefix + "-58");
				expect(renamedFiles[3]).to.be(arg.filePrefix + "-74");
				expect(renamedFiles[4]).to.be(arg.filePrefix + "-90");
				done();
			});
			it('should return XML with a photo count of 1', function (done) {
				var arg = {"filePrefix": 'photo_prefix', "photosInDay": 1},
					xml = page.getRenamedFiles(arg).xml;
				expect(xml).to.be.an('string');
				expect(xml).to.be("<photo id=\"1\"><filename>" + arg.filePrefix + "-50.jpg</filename></photo>");
				done();
			});
			it('should return XML with a photo count of 2', function (done) {
				var arg = {"filePrefix": 'photo_prefix', "photosInDay": 2},
					xml = page.getRenamedFiles(arg).xml;
				expect(xml).to.be.an('string');
				expect(xml).to.be("<photo id=\"1\"><filename>" + arg.filePrefix + "-50.jpg</filename></photo><photo id=\"2\"><filename>" + arg.filePrefix + "-90.jpg</filename></photo>");
				done();
			});
		});
		describe('setParentFolderLink()', function () {
			it('should fail without argument', function (done) {
				var arg;
				expect(page.setParentFolderLink).withArgs(arg).to.throwException(function (exception) { // get the exception object
					expect(exception).to.be.a(ReferenceError);
					expect(page.setParentFolderLink).withArgs(arg).to.throwException(new RegExp(page.error.missingArg));
					done();
				});
			});
			it('should fail without prefix argument', function (done) {
				var arg = {};
				expect(page.setParentFolderLink).withArgs(arg).to.throwException(function (exception) { // get the exception object
					expect(exception).to.be.a(ReferenceError);
					expect(page.setParentFolderLink).withArgs(arg).to.throwException(new RegExp(page.error.missingArgQuerystring));
					done();
				});
			});
			it('should return blank values', function (done) {
				var arg = {"querystring": {}},
					out = page.setParentFolderLink(arg);
				expect(out).to.be.an("object");
				expect(out.href).to.be("");
				expect(out.text).to.be("");
				done();
			});
			it('should return blank folder when folder querystring is blank', function (done) {
				var arg = {"querystring": {"folder": ""}},
					out = page.setParentFolderLink(arg);
				expect(out).to.be.an("object");
				expect(out.href).to.be("?folder=");
				expect(out.text).to.be("");
				done();
			});
			it('should return blank folder when folder querystring contains name', function (done) {
				var arg,
					prevFolderName = "gallery-demo",
					out;
				arg = {"querystring": {"folder": prevFolderName + "/"}};
				out = page.setParentFolderLink(arg);
				expect(out).to.be.an("object");
				expect(out.href).to.be("?folder=");
				expect(out.text).to.be("/");
				done();
			});
			it('should return folder name when folder querystring contains name', function (done) {
				var arg,
					prevFolderName = "gallery-demo",
					lastFolderName = "/media",
					out;
				arg = {"querystring": {"folder": prevFolderName + lastFolderName + "/"}};
				out = page.setParentFolderLink(arg);
				expect(out).to.be.an("object");
				expect(out.href).to.be("?folder=" + prevFolderName + "/");
				expect(out.text).to.be(prevFolderName);
				done();
			});
		});
	});
});
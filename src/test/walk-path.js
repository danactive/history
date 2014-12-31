/*global describe, it, require*/
var expect = require("expect.js");

describe('Admin:', function () {
	describe('Resize & rename photos:', function () {
		var page = require("../js/walk-path.browser.js");
		describe('getRenamedFiles()', function () {
			var arg;
			it('should fail without argument', function (done) {
				expect(page.getRenamedFiles).withArgs(arg).to.throwException(function (exception) { // get the exception object
					expect(exception).to.be.a(ReferenceError);
					expect(page.getRenamedFiles).withArgs(arg).to.throwException(new RegExp(page.error.missingArg));
					done();
				});
			});
			it('should fail without prefix argument', function (done) {
				arg = {};
				expect(page.getRenamedFiles).withArgs(arg).to.throwException(function (exception) { // get the exception object
					expect(exception).to.be.a(ReferenceError);
					expect(page.getRenamedFiles).withArgs(arg).to.throwException(new RegExp(page.error.missingArgPrefix));
					done();
				});
			});
			it('should fail without day count argument', function (done) {
				arg.filePrefix = "";
				expect(page.getRenamedFiles).withArgs(arg).to.throwException(function (exception) { // get the exception object
					expect(exception).to.be.a(ReferenceError);
					expect(page.getRenamedFiles).withArgs(arg).to.throwException(new RegExp(page.error.missingArgDayCount));
					done();
				});
			});
			it('should return an array of renamed files with a photo count of 1', function (done) {
				var renamedFiles;
				arg.filePrefix = "photo_prefix";
				arg.photosInDay = 1;
				renamedFiles = page.getRenamedFiles(arg).files;
				
				expect(renamedFiles).to.be.an('array');
				expect(renamedFiles.length).to.be(arg.photosInDay);
				expect(renamedFiles[0]).to.be(arg.filePrefix + "-50");
				done();
			});
			it('should return XML with a photo count of 1', function (done) {
				var xml = page.getRenamedFiles(arg).xml;
				expect(xml).to.be.an('string');
				expect(xml).to.be("<photo id=\"1\"><filename>" + arg.filePrefix + "-50.jpg</filename></photo>");
				done();
			});
			it('should return an array of renamed files with a photo count of 2', function (done) {
				var renamedFiles;
				arg.photosInDay = 2;
				renamedFiles = page.getRenamedFiles(arg).files;
				
				expect(renamedFiles).to.be.an('array');
				expect(renamedFiles.length).to.be(arg.photosInDay);
				expect(renamedFiles[0]).to.be(arg.filePrefix + "-50");
				expect(renamedFiles[1]).to.be(arg.filePrefix + "-90");
				done();
			});
			it('should return XML with a photo count of 2', function (done) {
				var xml = page.getRenamedFiles(arg).xml;
				expect(xml).to.be.an('string');
				expect(xml).to.be("<photo id=\"1\"><filename>" + arg.filePrefix + "-50.jpg</filename></photo><photo id=\"2\"><filename>" + arg.filePrefix + "-90.jpg</filename></photo>");
				done();
			});
			it('should return an array of renamed files with a photo count of 3', function (done) {
				var renamedFiles;
				arg.photosInDay = 3;
				renamedFiles = page.getRenamedFiles(arg).files;
				
				expect(renamedFiles).to.be.an('array');
				expect(renamedFiles.length).to.be(arg.photosInDay);
				expect(renamedFiles[0]).to.be(arg.filePrefix + "-37");
				expect(renamedFiles[1]).to.be(arg.filePrefix + "-64");
				expect(renamedFiles[2]).to.be(arg.filePrefix + "-90");
				done();
			});
			it('should return an array of renamed files with a photo count of 4', function (done) {
				var renamedFiles;
				arg.photosInDay = 4;
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
				var renamedFiles;
				arg.photosInDay = 5;
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
			it('should return an array of renamed files with a photo count of 34', function (done) {
				var renamedFiles;
				arg.photosInDay = 34;
				arg.xmlStartPhotoId = 4;
				renamedFiles = page.getRenamedFiles(arg).files;
				
				expect(renamedFiles).to.be.an('array');
				expect(renamedFiles.length).to.be(arg.photosInDay);
				expect(renamedFiles[0]).to.be(arg.filePrefix + "-12");
				expect(renamedFiles[1]).to.be(arg.filePrefix + "-14");
				expect(renamedFiles[2]).to.be(arg.filePrefix + "-17");
				expect(renamedFiles[3]).to.be(arg.filePrefix + "-19");
				expect(renamedFiles[4]).to.be(arg.filePrefix + "-21");
				expect(renamedFiles[5]).to.be(arg.filePrefix + "-24");
				expect(renamedFiles[6]).to.be(arg.filePrefix + "-26");
				expect(renamedFiles[7]).to.be(arg.filePrefix + "-29");
				expect(renamedFiles[8]).to.be(arg.filePrefix + "-31");
				expect(renamedFiles[9]).to.be(arg.filePrefix + "-33");
				expect(renamedFiles[10]).to.be(arg.filePrefix + "-36");
				expect(renamedFiles[11]).to.be(arg.filePrefix + "-38");
				expect(renamedFiles[12]).to.be(arg.filePrefix + "-40");
				expect(renamedFiles[13]).to.be(arg.filePrefix + "-43");
				expect(renamedFiles[14]).to.be(arg.filePrefix + "-45");
				expect(renamedFiles[15]).to.be(arg.filePrefix + "-48");
				expect(renamedFiles[16]).to.be(arg.filePrefix + "-50");
				expect(renamedFiles[17]).to.be(arg.filePrefix + "-52");
				expect(renamedFiles[18]).to.be(arg.filePrefix + "-55");
				expect(renamedFiles[19]).to.be(arg.filePrefix + "-57");
				expect(renamedFiles[20]).to.be(arg.filePrefix + "-60");

				expect(renamedFiles[33]).to.be(arg.filePrefix + "-90");
				done();
			});
			it('should return an array of renamed files with a photo count of 62', function (done) {
				var renamedFiles;
				arg.photosInDay = 62;
				arg.xmlStartPhotoId = 100;
				renamedFiles = page.getRenamedFiles(arg).files;
				
				expect(renamedFiles).to.be.an('array');
				expect(renamedFiles.length).to.be(arg.photosInDay);
				expect(renamedFiles[0]).to.be(arg.filePrefix + "-11");
				expect(renamedFiles[1]).to.be(arg.filePrefix + "-12");
				expect(renamedFiles[2]).to.be(arg.filePrefix + "-13");
				expect(renamedFiles[3]).to.be(arg.filePrefix + "-15");
				expect(renamedFiles[4]).to.be(arg.filePrefix + "-16");
				expect(renamedFiles[5]).to.be(arg.filePrefix + "-17");
				expect(renamedFiles[6]).to.be(arg.filePrefix + "-19");
				expect(renamedFiles[7]).to.be(arg.filePrefix + "-20");
				expect(renamedFiles[8]).to.be(arg.filePrefix + "-21");
				expect(renamedFiles[9]).to.be(arg.filePrefix + "-23");
				expect(renamedFiles[10]).to.be(arg.filePrefix + "-24");
				expect(renamedFiles[11]).to.be(arg.filePrefix + "-25");
				expect(renamedFiles[12]).to.be(arg.filePrefix + "-26");
				expect(renamedFiles[13]).to.be(arg.filePrefix + "-28");
				expect(renamedFiles[14]).to.be(arg.filePrefix + "-29");
				expect(renamedFiles[15]).to.be(arg.filePrefix + "-30");
				expect(renamedFiles[16]).to.be(arg.filePrefix + "-32");
				expect(renamedFiles[17]).to.be(arg.filePrefix + "-33");
				expect(renamedFiles[18]).to.be(arg.filePrefix + "-34");
				expect(renamedFiles[19]).to.be(arg.filePrefix + "-36");
				expect(renamedFiles[20]).to.be(arg.filePrefix + "-37");

				expect(renamedFiles[60]).to.be(arg.filePrefix + "-89");
				expect(renamedFiles[61]).to.be(arg.filePrefix + "-90");
				done();
			});
		});
		describe('setParentFolderLink()', function () {
			var arg;
			it('should fail without argument', function (done) {
				expect(page.setParentFolderLink).withArgs(arg).to.throwException(function (exception) { // get the exception object
					expect(exception).to.be.a(ReferenceError);
					expect(page.setParentFolderLink).withArgs(arg).to.throwException(new RegExp(page.error.missingArg));
					done();
				});
			});
			it('should fail without prefix argument', function (done) {
				arg = {};
				expect(page.setParentFolderLink).withArgs(arg).to.throwException(function (exception) { // get the exception object
					expect(exception).to.be.a(ReferenceError);
					expect(page.setParentFolderLink).withArgs(arg).to.throwException(new RegExp(page.error.missingArgQuerystring));
					done();
				});
			});
			it('should return blank values', function (done) {
				var out;
				arg.querystring = {};
				out = page.setParentFolderLink(arg);

				expect(out).to.be.an("object");
				expect(out.href).to.be("");
				expect(out.text).to.be("");
				done();
			});
			it('should return blank folder when folder querystring is blank', function (done) {
				var out;
				arg.querystring.folder = "";
				out = page.setParentFolderLink(arg);

				expect(out).to.be.an("object");
				expect(out.href).to.be("");
				expect(out.text).to.be("");
				done();
			});
			it('should return blank folder when folder querystring contains name', function (done) {
				var lastFolderName = "gallery-demo",
					out;
				arg.querystring.folder = "/" + lastFolderName;
				out = page.setParentFolderLink(arg);

				expect(out).to.be.an("object");
				expect(out.href).to.be("");
				expect(out.text).to.be("/");
				done();
			});
			it('should return folder name when folder querystring contains name', function (done) {
				var prevFolderName = "gallery-demo",
					lastFolderName = "media",
					out;
				arg.querystring.folder = "/" + prevFolderName + "/" + lastFolderName;
				out = page.setParentFolderLink(arg);

				expect(out).to.be.an("object");
				expect(out.href).to.be("?folder=/" + prevFolderName);
				expect(out.text).to.be(prevFolderName);
				done();
			});
			it('should return folder name when 2nd folder querystring contains name', function (done) {
				var baseFolderName = "gallery-demo",
					prevFolderName = "media",
					lastFolderName = "photos",
					out;
				arg.querystring.folder = "/" + baseFolderName + "/" + prevFolderName + "/" + lastFolderName;
				out = page.setParentFolderLink(arg);

				expect(out).to.be.an("object");
				expect(out.href).to.be("?folder=/" + baseFolderName + "/" + prevFolderName);
				expect(out.text).to.be(prevFolderName);
				done();
			});
			it('should return folder name when 3rd folder querystring contains name', function (done) {
				var baseFolderName = "gallery-demo/media",
					prevFolderName = "photos",
					lastFolderName = "2000",
					out;
				arg.querystring.folder = "/" + baseFolderName + "/" + prevFolderName + "/" + lastFolderName;
				out = page.setParentFolderLink(arg);

				expect(out).to.be.an("object");
				expect(out.href).to.be("?folder=/" + baseFolderName + "/" + prevFolderName);
				expect(out.text).to.be(prevFolderName);
				done();
			});
		});
	});
});

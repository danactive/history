/*global describe, it, require*/
var expect = require("expect.js");

describe('Admin:', function () {
	describe('Resize & rename photos:', function () {
		var page = require("../js/walk-path.browser.js");
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

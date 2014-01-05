	/*global console, describe, it, require*/
var expect = require("expect.js");

describe('Admin:', function () {
	describe('Directory contents API:', function () {
		var page = require("../js/admin-directory-contents-api.js");
		it('should fail with missing callback', function () {
			expect(page.getContents().error).to.be(page.error.missingCallback);
		});
		it('should fail with missing path', function () {
			var path = "fail_test_path";
			function callback () {}
			expect(page.getContents({"request": {"query": {"folder": path}}}, callback).error).to.contain(page.error.missingPath);
		});
		it('should fail with missing files', function () {
			var path = "test/fixture/childless";
			function callback () {}
			expect(page.getContents({"request": {"query": {"folder": path}}}, callback).error).to.contain(page.error.missingFiles);
		});
		it('should match current folder and filenames', function () {
			var error = "No callback error",
				path = "test/fixture/cjt",
				getContents;
			function callback (arg) {
				expect(arg).to.be.an('object');
				expect(arg.currentFolder).to.be.a('string');
				expect(arg.currentFolder).to.contain(path);
				expect(arg.filenames).to.be.an('array');
				expect(arg.filenames).to.contain('cee.css');
				expect(arg.filenames).to.contain('jay.js');
				expect(arg.filenames).to.contain('tee.txt');
				return { "error": error };
			}
			getContents = page.getContents({"request": {"query": {"folder": path}}}, callback);
			expect(getContents.error).to.be(error);
		});
	});
});
/*global exports, require*/

exports.list = function (param) {
	var currentFolder = "",
		filenames,
		response = param.response,
		request = param.request;

	function init(callback) { // set variables
		var filePath = '.',
			fs = require('fs'),
			paramsWithValue = require('querystring').parse(require('url').parse(request.url).query);

		if (paramsWithValue) {
			if (paramsWithValue.folder) {
				currentFolder = paramsWithValue.folder + '/';
				filePath = './' + currentFolder;
			}
		}
		if (fs.existsSync(filePath)) {
			filenames = fs.readdirSync(filePath);
		} else {
			return { "error": "Path does not exist: " + filePath };
		}
		if (!filenames) {
			return { "error": "No files found in this path: " + filePath };
		}
		return (callback) ? callback() : { "error": "Missing a display method callback" };
	}

	function generateJson() {
		var isFolder,
			isRasterFile,
			jsonPackage = { "items": [] },
			len = filenames.length,
			path = require('path'),
			safeFilename;
		/*
		{
			name: string
			ext (extension): string
			path: {
				abs (absolute): string
				nav (navigate): string
				rel (relative): string
			}
			content: {
				type: string
				width: int
				height: int
			}
		}
		*/

		filenames.forEach(function (filename) {
			var jsonItem = {};
			jsonItem.ext = path.extname(filename);
			jsonItem.name = path.basename(filename, jsonItem.ext);
			jsonItem.path = {};
			safeFilename = encodeURIComponent(filename);
			jsonItem.path.abs = currentFolder + safeFilename;
			jsonItem.path.nav = ".?folder=" + currentFolder + safeFilename;
			jsonItem.path.rel = safeFilename;
			jsonPackage.items.push(jsonItem);
		});
		return jsonPackage;
	}

	response.writeHead(200, {'Content-Type': 'application/json'});
	response.end(JSON.stringify(init(generateJson)));
};
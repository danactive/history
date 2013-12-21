exports.list = function (param) {
	var currentFolder = "",
		filenames,
		response = param.response,
		request = param.request;

	response.writeHead(200, {'Content-Type': 'application/json'});
	response.end(JSON.stringify(init(generateJson)));

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

		function extension(filename) {
			var extname = path.extname(safeFilename);
			return (extname.charAt(0) === ".") ? extname.substring(1) : extname;
		}

		filenames.forEach(function (filename) {
			var jsonItem = {};
			safeFilename = encodeURIComponent(filename);
			jsonItem.ext = extension(safeFilename);
			jsonItem.name = path.basename(safeFilename, "." + jsonItem.ext);
			jsonItem.path = {};
			jsonItem.path.abs = currentFolder + safeFilename;
			jsonItem.path.nav = ".?folder=" + currentFolder + safeFilename;
			jsonItem.path.rel = safeFilename;
			jsonPackage.items.push(jsonItem);
		});
		return jsonPackage;
	}
}
/*global exports, require*/

var error = {
	"missingCallback": "Missing a display method callback",
	"missingFiles": "No files found in this path: ",
	"missingPath": "Path does not exist: "
};
exports.error = error;

/**
Read the directory contents: files or folders

@method getContents
@async
@param {object} arg arguments
@param {object} arg.response express response
@param {object} arg.request express request
@param {function} callback
@param {function} callback.arg returned argument
@param {string} callback.arg.currentFolder
@param {array} callback.arg.filenames folders or files
@return {object} arg
@return {string} arg.error
**/
function getContents(arg, callback) {
	var currentFolder = "",
		filenames,
		filePath = '.',
		fs = require('fs');

	if (arg && arg.request && arg.request.query) {
		if (arg.request.query.folder) {
			currentFolder = arg.request.query.folder + '/';
			filePath = './' + currentFolder;
		}
	}
	if (fs.existsSync(filePath)) {
		filenames = fs.readdirSync(filePath);
	} else {
		return { "error": error.missingPath + filePath };
	}
	if (!filenames || filenames.length === 0) {
		return { "error": error.missingFiles + filePath };
	}
	return (callback) ? callback({"currentFolder": currentFolder, "filenames": filenames}) : { "error": error.missingCallback };
}
exports.getContents = getContents;

/**
List and emit the directory contents: files or folders as JSON

@method list
@param {object} arg arguments
@param {object} arg.response express response
@param {object} arg.request express request
**/
exports.list = function (arg) {
	var response = arg.response,
		request = arg.request;

	function generateJson(arg) {
		var currentFolder = arg.currentFolder,
			filenames = arg.filenames,
			isFolder,
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
		function getType (extension) {
			if (extension.toLowerCase().match(/\.(png|jpg|jpeg|gif)$/)) {
				return "image";
			} else if (extension.toLowerCase().match(/\.(mov)$/)) {
				return "video";
			} else if (extension === "") {
				return "folder";
			}
			return;
		}

		filenames.forEach(function (filename) {
			var jsonItem = {};
			jsonItem.ext = path.extname(filename); // case-insensitive
			jsonItem.name = path.basename(filename, jsonItem.ext);
			jsonItem.path = {};
			safeFilename = encodeURIComponent(filename);
			jsonItem.path.abs = '/' + currentFolder + safeFilename;
			jsonItem.path.nav = ".?folder=" + currentFolder + safeFilename;
			jsonItem.path.rel = '../../' + currentFolder + safeFilename;
			jsonItem.content = {};
			jsonItem.content.type = getType(jsonItem.ext);
			jsonPackage.items.push(jsonItem);
		});
		return jsonPackage;
	}

	response.writeHead(200, {'Content-Type': 'application/json'});
	response.end(JSON.stringify(getContents(arg, generateJson)));
};
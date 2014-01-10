/*global exports, require*/

var error = {
	"missingArg": "Missing required argument",
	"missingCallback": "Missing a display method callback",
	"missingCurrentFolder": "Missing current folder",
	"missingFiles": "No files found in this path: ",
	"missingFilenames": "Missing filenames array",
	"missingPath": "Path does not exist: "
};
exports.error = error;

/**
Read the directory contents: files or folders

@method getContents
@async
@param {object} arg arguments
@param {string} arg.folder directory path for content retreival
@param {function} callback
@param {function} callback.param returned parameter
@param {string} callback.param.currentFolder
@param {array} callback.param.filenames folders or files
@param {string} callback.param.error
@return {undefined}
**/
function getContents(arg, callback) {
	var currentFolder = "",
		filenames,
		filePath = '.',
		fs = require('fs');

	if (callback === undefined) {
		throw new ReferenceError(error.missingCallback);
	}

	if (arg && arg.folder) {
		currentFolder = arg.folder + '/';
		filePath = './' + currentFolder;
	}
	if (fs.existsSync(filePath)) {
		filenames = fs.readdirSync(filePath);
	} else {
		return callback({ "error": error.missingPath + filePath, "currentFolder": currentFolder, "filenames": filenames });
	}
	if (filenames === undefined || filenames.length === 0 || (filenames.length === 1 && filenames[0] === ".gitkeep")) { // workaround as git doesn't allow empty folders
		return callback({ "error": error.missingFiles + filePath, "currentFolder": currentFolder, "filenames": filenames });
	}
	return callback({ "currentFolder": currentFolder, "filenames": filenames });
}
exports.getContents = getContents;

/**
Format directory contents: files or folders as JSON

@method generateJson
@param {string} arg callback of getContents
**/
function generateJson(arg) {
	var currentFolder,
		filenames,
		isFolder,
		isRasterFile,
		jsonPackage = { "items": [] },
		len,
		path = require('path'),
		safeFilename;
	if (arg === undefined) {
		throw new ReferenceError(error.missingArg);
	}
	if (arg.error) {
		throw arg.error;
	}
	if (arg.currentFolder === undefined) {
		throw new ReferenceError(error.missingCurrentFolder);
	}
	if (arg.filenames === undefined) {
		throw new ReferenceError(error.missingFilenames);
	}
	currentFolder = arg.currentFolder;
	filenames = arg.filenames;
	len = filenames.length;
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
		jsonItem.path.abs = '/' + currentFolder;
		jsonItem.path.nav = ".?folder=" + currentFolder;
		jsonItem.path.rel = '../../' + currentFolder;
		jsonItem.content = {};
		jsonItem.content.type = getType(jsonItem.ext);
		jsonPackage.items.push(jsonItem);
	});
	return jsonPackage;
}
exports.generateJson = generateJson;

/**
List and emit the directory contents: files or folders as JSON

@method list
@param {object} arg arguments
@param {string} arg.error
@param {object} arg.response express response
@param {object} arg.request express request
@param {object} arg.request.query.folder query-string variable folder path
**/
exports.list = function (arg) {
	var json,
		folder,
		response = arg.response,
		request = arg.request;
	folder = (request.query && request.query.folder) || arg.folder; // query-string or direct variable
	getContents({"folder": folder}, function (arg) { json = generateJson(arg); });
	
	response.writeHead(200, {'Content-Type': 'application/json'});
	response.end(JSON.stringify(json));
};
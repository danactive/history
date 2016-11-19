/*global console, module, require*/
'use strict';
var boom = require("boom"),
	constant = require("./global-constant.js"),
	error = {
		"missingArg": "Missing required argument",
		"missingArgCallback": "Missing a display method callback (required argument)",
		"missingArgFolder": "Missing required argument current folder",
		"missingFiles": "No files found in this path: ",
		"missingArgFilenames": "Missing required argument filenames array",
		"missingPath": "Path does not exist: "
	},
	debugMsg,
	fs = require('fs'),
	util = require("./util.js");
debugMsg = function (msg) {
	if (constant.config.debug && constant.config.debug === true) {
		console.log(msg);
	}
};
module.exports.error = error;

/***
*      #####                   #####
*     #     # ###### #####    #     #  ####  #    # ##### ###### #    # #####  ####
*     #       #        #      #       #    # ##   #   #   #      ##   #   #   #
*     #  #### #####    #      #       #    # # #  #   #   #####  # #  #   #    ####
*     #     # #        #      #       #    # #  # #   #   #      #  # #   #        #
*     #     # #        #      #     # #    # #   ##   #   #      #   ##   #   #    #
*      #####  ######   #       #####   ####  #    #   #   ###### #    #   #    ####
*
*/
/**
Read the directory contents: files or folders

@method getContents
@async
@param {string} folder directory path for content retreival
@param {function} callback
@param {function} callback.param returned parameter
@param {string} callback.param.folder
@param {array} callback.param.filenames folders or files
@param {string} callback.param.error
@return {undefined}
**/
function getContents(folder, callback) {
	var filePath,
		path = require("path");
	folder = (folder === undefined) ? "/" : decodeURIComponent(folder);
	filePath = path.join("./", folder);

	fs.exists(filePath, function (exists) {
		if (!exists) {
			throw boom.notFound(error.missingPath + filePath);
		}
		fs.readdir(filePath, function (err, filenames) {
			var out = {
				"filenames": filenames,
				"folder": folder
			};
			if (err || filenames === undefined || filenames.length === 0) {
				throw boom.notFound(error.missingPath + filePath, err || filenames);
			}
			if (filenames.length === 1 && filenames[0] === ".gitkeep") { // workaround as git doesn't allow empty folders
				return callback(out); // todo
			}
			return callback(out);
		});
	});
}
module.exports.getContents = getContents;

/***
*      #####                                                           #  #####  ####### #     #
*     #     # ###### #    # ###### #####    ##   ##### ######          # #     # #     # ##    #
*     #       #      ##   # #      #    #  #  #    #   #               # #       #     # # #   #
*     #  #### #####  # #  # #####  #    # #    #   #   #####           #  #####  #     # #  #  #
*     #     # #      #  # # #      #####  ######   #   #         #     #       # #     # #   # #
*     #     # #      #   ## #      #   #  #    #   #   #         #     # #     # #     # #    ##
*      #####  ###### #    # ###### #    # #    #   #   ######     #####   #####  ####### #     #
*
*/
/**
Format directory contents: files or folders as JSON

@method generateJson
@param {string} arg callback of getContents
**/
function generateJson(arg) {
	var folder,
		filenames,
		out = { "meta": {}, "result": { "items": [] }},
		path = require('path');
	if (arg === undefined) {
		throw new ReferenceError(error.missingArg);
	}
	if (arg.folder === undefined) {
		throw new ReferenceError(error.missingArgFolder);
	}
	if (arg.filenames === undefined) {
		throw new ReferenceError(error.missingArgFilenames);
	}
	folder = arg.folder;
	filenames = arg.filenames;
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
		jsonItem.ext = path.extname(filename); // case-insensitive
		jsonItem.name = path.basename(filename, jsonItem.ext);
		jsonItem.name_safe = path.basename(filename, jsonItem.ext).replace(/[\.\s\(\)]/g, "_");
		jsonItem.path = {};
		jsonItem.path.abs = folder;
		jsonItem.path.nav = "?folder=" + ((folder === "/") ? "" : folder);
		jsonItem.path.rel = '../..' + folder;
		jsonItem.content = {};
		jsonItem.content.type = getType(jsonItem.ext);
		out.result.items.push(jsonItem);
	});
	return out;
}
module.exports.generateJson = generateJson;

/***
*      #####                  #     #
*     #     # ###### #####    ##   ## ###### #####   ##
*     #       #        #      # # # # #        #    #  #
*     #  #### #####    #      #  #  # #####    #   #    #
*     #     # #        #      #     # #        #   ######
*     #     # #        #      #     # #        #   #    #
*      #####  ######   #      #     # ######   #   #    #
*
*/
/**
List and emit the directory contents: files or folders as JSON

@method getMeta
@param {string} folder
@param {function} callback
**/
module.exports.getMeta = function (folder, cb) {
	var out;
	debugMsg("getMeta's folder is " + folder);
	getContents(folder, function (arg) {
		out = generateJson(arg);

		if (cb) {
			cb(out);
		}
	});
};

/***
*     ######                                                  #     #
*     #     # #####  ###### #####     ######  ####  #####     #     # # ###### #    #
*     #     # #    # #      #    #    #      #    # #    #    #     # # #      #    #
*     ######  #    # #####  #    #    #####  #    # #    #    #     # # #####  #    #
*     #       #####  #      #####     #      #    # #####      #   #  # #      # ## #
*     #       #   #  #      #         #      #    # #   #       # #   # #      ##  ##
*     #       #    # ###### #         #       ####  #    #       #    # ###### #    #
*
*/
/**
Same as getMeta with additional formatting for view

@method prepForView
@param {string} folder
@param {function} callback
**/
module.exports.prepForView = function (meta, args, callback) {
	meta.result.items.forEach(function (item) {
		item.view = {};
		if (item.content.type === "folder" && item.name !== constant.tempThumbFolder) {
			item.view.type = "folderNoPreview";
		} else if (item.content.type === 'image' && args.preview === true) {
			item.view.type = "imagePreview";
		} else if (item.content.type === 'image' && args.preview !== false) {
			item.view.type = "imageNoPreview";
		} else if (item.content.type === "folder" && item.name === constant.tempThumbFolder) {
			item.view.type = "folderPreview";
		} else {
			item.view.type = "file";
		}
	});
	callback(meta);
};


/***
*      #####                   #####
*     #     # ###### #####    #     #   ##   #      #      ###### #####  #   #
*     #       #        #      #        #  #  #      #      #      #    #  # #
*     #  #### #####    #      #  #### #    # #      #      #####  #    #   #
*     #     # #        #      #     # ###### #      #      #      #####    #
*     #     # #        #      #     # #    # #      #      #      #   #    #
*      #####  ######   #       #####  #    # ###### ###### ###### #    #   #
*
*/
module.exports.getGalleries = function (cb) {
	var folder = ".";
	fs.readdir(folder, function (err, files) {
		var galleries = [],
			out = {
				"meta": {
					"source": {
						"type": "absolute",
						"path": require("path").resolve(folder)
					},
					"methodVersion": '2.0.0'
				},
				"payload": {}
			};

		if (err) {
			return cb(require("extend")(true, out, util.setError(err)));
		}

		files.forEach(function (filename) {
			if (filename.indexOf('gallery-') === 0) {
				galleries.push(filename.substr(8));
			}
		});

		out.payload.galleries = galleries;

		return cb(out);
	});
};

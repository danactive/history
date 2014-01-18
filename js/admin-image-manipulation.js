/*global __dirname, console, module, require*/
var _error = {
	"emptyRenameFile": "Empty filename found, cannot rename file",
	"missingArg": "Missing required argument",
	"missingArgCurrentFiles": "Missing required argument current files",
	"missingArgFilename": "Missing required argument filename",
	"missingArgFolderName": "Missing required argument folder name",
	"missingArgNewFiles": "Missing required argument new files",
	"missingArgSourcePath": "Missing required argument source path"
};
module.exports.error = _error;

/**
Generate preview sized thumbnail photos for directory viewing

@method preview
@param {object} arg arguments
@param {object} arg.body Express POST variables
@param {string} arg.body.folder Path to directory
@return {undefined}
**/
module.exports.preview = function (arg) {
	var constant = arg.constant,
		directory = require("../js/admin-directory-contents-api.js"),
		response = arg.response,
		request = arg.request;

	function initShrinkImages(directoryContentsArg) {
		var dimension = {"width": 200, "height": 200},
			count = {
				"imageLoop": 0,
				"thumbCreated": 0
			},
			json,
			out = [],
			queue;
		if (directoryContentsArg.error) {
			throw directoryContentsArg.error;
		}
		json = directory.generateJson(directoryContentsArg);
		function possibleOutput() {
			var done = false;
			if (count.imageLoop === 0) { // no images in this directory
				done = true;
			} else if (count.thumbCreated === count.imageLoop) {
				done = true;
			}
			if (done === true) {
				response.writeHead(200, {'Content-Type': 'application/json'});
				response.end(JSON.stringify({"thumbnails":out}));
			}
		}
		function ifImage(item) {
			function createThumb(item) {
				var sourcePath = require('path').dirname(__dirname) + "/" + item.path.abs,
					outputPath = sourcePath + constant.tempThumbFolder + "/",
					filename = item.name + item.ext;

				require('mkdirp')(outputPath, function (errorNewPath) {
					if (errorNewPath) {
						throw errorNewPath;
					}

					if (require('fs').existsSync(outputPath + filename)) { // file exists
						count.thumbCreated++;
						possibleOutput();
						return;
					}
					require('gm')(sourcePath + filename)
						.resize(dimension.width, dimension.height + ">")
						.gravity('Center')
						.extent(dimension.width, dimension.height)
						.write(outputPath + filename, function (errorWriting) {
							if (errorWriting) {
								throw errorWriting;
							}
							count.thumbCreated++;
							possibleOutput();
						});
				});
			}
			if (item.content.type === "image") {
				count.imageLoop++;
				createThumb(item);
				out.push(constant.tempThumbFolder + "/" + item.name + item.ext);
			}
		}
		queue = require("async").queue(function (item, callback) {
			ifImage(item);
			callback();
		}, 1);

		queue.push(json.items, function(errorEach){
			if (errorEach) {
				throw errorEach;
			}
		});
		queue.drain = possibleOutput;
	}

	directory.getContents({"folder": decodeURIComponent(request.body.folder)}, initShrinkImages);
};

/**
Create directory or use existing directory

@method ensureDestinationFolder
@param {object} arg arguments
@param {string} arg.folderName Destination folder's name for this photo batch
@param {string} [arg.destinationRootPath=resizeImages] Destination photo path excluding filename
@return {string[]} paths to verified directories
**/
function _ensureDestinationFolder(arg) {
	var destinationPath,
		mkdrip = require('mkdirp'),
		out = [];
	if (arg === undefined) {
		throw new ReferenceError(_error.missingArg);
	}
	if (arg.folderName === undefined) {
		throw new ReferenceError(_error.missingArgFolderName);
	}
	destinationPath = arg.destinationRootPath || (require('path').dirname(__dirname) + '/resizeImages/');

	function createOrVerifyFolder(folder) {
		var folderPath = destinationPath + folder + '/' + arg.folderName;
		try {
			mkdrip.sync(folderPath);
		} catch (err) {
			throw err;
		}
		return folderPath;
	}
	out.push(createOrVerifyFolder("originals"));
	out.push(createOrVerifyFolder("photos"));
	out.push(createOrVerifyFolder("thumbs"));
	
	return out;
}
module.exports.ensureDestinationFolder = _ensureDestinationFolder;
/**
Move source photo to destination originals folder

@method movePhotos
@param {object} arg arguments
@param {string} arg.sourceFolderPath Original photo path excluding filename
@param {string} [arg.destinationRootPath=resizeImages] Destination photo path excluding filename
@param {string} arg.folderName Destination folder's name for this photo batch inside the originals, photos, or thumbs folders
@param {string[]} arg.newFiles Ordered list of new renamed files (extension excluded)
@param {string[]} arg.currentFiles Ordered list of current files (extension excluded)
@return {object} arg arguments
@return {string[]} arg.files Collection of before and after filename
**/
function _movePhotos(arg, callback) {
	var afterRename,
		beforeRename,
		callbackCount = 0,
		destinationPath,
		files = [],
		folderName,
		queue,
		sourceFolderPath;
	if (arg === undefined) {
		throw new ReferenceError(_error.missingArg);
	}
	if (arg.sourceFolderPath === undefined) {
		throw new ReferenceError(_error.missingArgSourcePath);
	}
	if (arg.folderName === undefined) {
		throw new ReferenceError(_error.missingArgFolderName);
	}
	if (arg.currentFiles === undefined || arg.currentFiles.length === 0) {
		throw new ReferenceError(_error.missingArgCurrentFiles);
	}
	if (arg.newFiles === undefined || arg.newFiles.length === 0) {
		throw new ReferenceError(_error.missingArgNewFiles);
	}
	destinationPath = arg.destinationRootPath || (require('path').dirname(__dirname) + '/resizeImages/originals/');
	destinationPath = decodeURIComponent(destinationPath);
	folderName = (arg.folderName === "") ? "" : arg.folderName + "/";
	sourceFolderPath = decodeURIComponent(arg.sourceFolderPath);

	arg.currentFiles.forEach(function (filename, index) {
		beforeRename = sourceFolderPath + filename;
		afterRename = destinationPath + folderName + arg.newFiles[index];
		if (beforeRename ===  undefined || beforeRename === "" || afterRename ===  undefined || afterRename === "") {
			throw new TypeError(_error.emptyRenameFile);
		}
		files.push({
			"beforeRename": beforeRename,
			"afterRename": afterRename
		});
	});

	function possibleCallback() { // calculate if all async calls are complete
		callbackCount++;
		
		if (callbackCount === (files.length + 1)) { // +1 for drain
			callback({"files": files});
		}
	}

	queue = require("async").queue(function (file, errorCallback) {
		require('fs').rename(file.beforeRename, file.afterRename, function (warningRename) {
			if (warningRename) {
				console.log("Image renaming warning: " + warningRename + "; Before filename=" + file.beforeRename + "; After filename=" + file.afterRename + ";");
			}
			possibleCallback();
		});
		errorCallback();
	}, 1);

	queue.push(files, function(errorEach){
		if (errorEach) {
			throw errorEach;
		}
	});
	queue.drain = possibleCallback;
}
module.exports.movePhotos = _movePhotos;

module.exports.resize = function (arg) {
	var path = require('path'),
		constant = arg.constant,
		gm = require('gm'),
		filename,
		folderName,
		photo = { width: 800, height: 600 },
		thumb = { width: 185, height: 45 },
		response = arg.response,
		request = arg.request;
	folderName = (request.query && request.query.folderName) || arg.folderName; // query-string or direct variable
	filename = (request.query && request.query.filename) || arg.filename; // query-string or direct variable
	if (arg === undefined) {
		throw new ReferenceError(_error.missingArg);
	}
	if (folderName === undefined) {
		throw new ReferenceError(_error.missingArgFolderName);
	}
	if (filename === undefined) {
		throw new ReferenceError(_error.missingArgFilename);
	}

	function transformImage (originalPaths) {
		gm(originalPaths.join(''))
			.autoOrient()
			.stream(function (errOrient, stdout, stderr) {
				var callbackCount = 0,
					callbackTotal = 2,
					errors = [],
					photoPaths = originalPaths.concat([]),
					thumbPaths = originalPaths.concat([]);
				photoPaths[2] = 'photos';
				thumbPaths[2] = 'thumbs';

				if (errOrient) {
					errors.push('Original orientation write error: ' + errOrient);
				}

				function possibleCompletion () {
					callbackCount++;
					if (callbackCount === callbackTotal) {
						response.writeHead(200, {'Content-Type': 'application/json'});
						response.end(JSON.stringify(
							{
								"meta": {
									"error": {
										"count": errors.length,
										"message": errors.join('; ')
									},
								},
								"result": {
									"paths": {
										"original": originalPaths.join(''),
										"photo": photoPaths.join(''),
										"thumb": thumbPaths.join('')
									}
								}
							}
						));
					}
				}

				gm(stdout)
					.resize(photo.width, photo.height)
					.write(photoPaths.join(''), function (errResize) {
						if (errResize) {
							errors.push('Photo resize write error: ' + errResize);
						}
						possibleCompletion();
					})
				;

				gm(stdout)
					.resize(thumb.width, thumb.height, "!")
					.noProfile()
					.write(thumbPaths.join(''), function (errResize) {
						if (errResize) {
							errors.push('Thumbnail resize write error: ' + errResize);
						}
						possibleCompletion();
					})
				;
			})
		;
	}

	transformImage([path.dirname(__dirname), '/resizeImages/', 'originals', '/', folderName, '/', filename]);
};

module.exports.rename = function (arg) {
	var constant = arg.constant,
		response = arg.response,
		request = arg.request;

	_ensureDestinationFolder({"folderName": request.body.folderName});

	_movePhotos({
		"currentFiles": request.body.currentFiles,
		"folderName": request.body.folderName,
		"newFiles": request.body.newFiles,
		"sourceFolderPath": request.body.sourceFolderPath
	}, function (moveArg) {
		response.writeHead(200, {'Content-Type': 'application/json'});
		response.end(JSON.stringify({"files": moveArg.files}));
	});
};
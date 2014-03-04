/*global __dirname, console, module, require*/
var _error = {
	"emptyRenameFile": "Empty filename found, cannot rename file",
	"missingArg": "Missing required argument",
	"missingArgConstant": "Missing required argument global constant",
	"missingArgCurrentFiles": "Missing required argument current files",
	"missingArgFilename": "Missing required argument filename",
	"missingArgFolderName": "Missing required argument folder name",
	"missingArgNewFiles": "Missing required argument new files",
	"missingArgResponse": "Missing required response object",
	"missingArgRequest": "Missing required request object",
	"missingArgRequestBodyFolder": "Missing required folder in request object",
	"missingArgSourcePath": "Missing required argument source path"
};
module.exports.error = _error;


/**
Generate preview sized thumbnail photos for directory viewing

@method preview
@param {object} arg arguments
@param {object} arg.constant global variables
@param {object} arg.body Express POST variables
@param {string} arg.body.folder Path to directory
@param {object} arg.response
@param {object} arg.request
@param {boolean} [arg.isTest]
@return {undefined}
**/
module.exports.preview = function (arg) {
	var constant,
		directory = require("../js/admin-directory-contents-api.js"),
		isTest,
		response,
		request;
	if (arg === undefined) {
		throw new ReferenceError(_error.missingArg);
	}
	if (arg.constant === undefined) {
		throw new ReferenceError(_error.missingArgConstant);
	}
	if (arg.response === undefined) {
		throw new ReferenceError(_error.missingArgResponse);
	}
	if (arg.request === undefined) {
		throw new ReferenceError(_error.missingArgRequest);
	}
	if (arg.request.body === undefined || arg.request.body.folder === undefined) {
		throw new ReferenceError(_error.missingArgRequestBodyFolder);
	}
	constant = arg.constant;
	isTest = arg.isTest || false;
	response = arg.response;
	request = arg.request;

	function ensureShrunkImages(directoryContentsArg) {
		var dimension = {"width": 200, "height": 200},
			count = {
				"imageInitiated": 0,
				"imageLength": 0,
				"thumbCreated": 0
			},
			json,
			out = [],
			queue;
		if (directoryContentsArg.error) {
			throw directoryContentsArg.error;
		}
		json = directory.generateJson(directoryContentsArg);
		count.imageLength = json.items.length;
		function possibleOutput(callee) {
			var done = false;
			if (constant.debug && constant.debug === true) {
				console.log("possibleOutput: count.thumbCreated="+count.thumbCreated+"; count.imageLength="+count.imageLength+"; callee="+callee+";");
			}
			if (count.imageLength === 0) { // no images in this directory
				done = true;
			} else if (count.thumbCreated === count.imageLength) {
				done = true;
			}
			if (done === true) {
				response.writeHead(200, {'Content-Type': 'application/json'});
				response.end(JSON.stringify({"thumbnails":out}));
			}
		}
		function afterThumbCreated(errorWriting) {
			if (errorWriting) {
				throw errorWriting;
			}
			count.thumbCreated++;
			possibleOutput("afterThumbCreated");
			count.imageInitiated++;
			addToQueue();
		}
		function ifImage(item) {
			function createThumb(item) {
				var sourcePath = require('path').dirname(__dirname) + item.path.abs,
					outputPath,
					filename = item.name + item.ext;
				if (constant.tempThumbFolder) {
					outputPath = sourcePath + constant.tempThumbFolder + "/";
				} else {
					outputPath = sourcePath;
				}
				if (constant.debug && constant.debug === true) {
					console.log("ifImage: filename="+filename+"; outputPath="+outputPath+";");
				}

				require('mkdirp')(outputPath, function (errorNewPath) {
					if (errorNewPath) {
						throw errorNewPath;
					}

					if (require('fs').existsSync(outputPath + filename)) { // file exists
						afterThumbCreated();
						return;
					}
					if (constant.debug && constant.debug === true) {
						console.log("ifImage resize image: filename="+filename+";");
					}
					if (isTest) {
						afterThumbCreated();
					} else {
						require('gm')(sourcePath + filename)
							.resize(dimension.width, dimension.height + ">")
							.gravity('Center')
							.extent(dimension.width, dimension.height)
							.write(outputPath + filename, afterThumbCreated);
					}
				});
			}
			if (item.content.type === "image") {
				if (constant.debug && constant.debug === true) {
					console.log("ifImage; start create thumb");
				}
				createThumb(item);
				if (constant.tempThumbFolder) {
					out.push(constant.tempThumbFolder + "/" + item.name + item.ext);
				} else {
					out.push(item.name + item.ext);
				}
			} else {
				if (constant.debug && constant.debug === true) {
					console.log("ifImage; file type="+item.content.type+";");
				}
				afterThumbCreated();
			}
		}
		function addToQueue() {
			var item = json.items[count.imageInitiated];
			if (item === undefined) {
				if (constant.debug && constant.debug === true) {
					console.log("addToQueue; item="+item+";");
				}
				return;
			}
			queue.push(item, function (errorEach) {
				if (errorEach) {
					throw errorEach;
				}
				var filename = item.name + item.ext;
				console.log("Processed image: " + filename + ";");
			});
		}
		queue = require("async").queue(function (item, callback) {
			var filename = item.name + item.ext;
			if (constant.debug && constant.debug === true) {
				console.log("Asynce queue item:"+filename+";");
			}
			ifImage(item);
			callback();
		}, 3);
		addToQueue();
	}

	directory.getContents({"folder": decodeURIComponent(request.body.folder)}, ensureShrunkImages);
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
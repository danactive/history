/*global __dirname, console, module, require*/
var _error = {
		"emptyRenameFile": "Empty filename found, cannot rename file",
		"missingArg": "Missing required argument",
		"missingArgDestination": "Missing required argument file destination",
		"missingArgAssets": "Missing required argument assets",
		"missingArgFolderName": "Missing required argument folder name",
		"missingArgMove": "Missing required argument move to resize boolean",
		"missingArgResponse": "Missing required response object",
		"missingArgRequest": "Missing required request object",
		"missingArgRequestBodyFolder": "Missing required folder in request object",
		"missingArgSource": "Missing required argument file source",
		"missingArgTargetPath": "Missing required argument target path"
	},
	constant = require("../js/global-constant.js"),
	path = require('path');
module.exports.error = _error;

/***
*     ######                                       
*     #     # #####  ###### #    # # ###### #    # 
*     #     # #    # #      #    # # #      #    # 
*     ######  #    # #####  #    # # #####  #    # 
*     #       #####  #      #    # # #      # ## # 
*     #       #   #  #       #  #  # #      ##  ## 
*     #       #    # ######   ##   # ###### #    # 
*                                                  
*/
/**
Generate preview sized thumbnail photos for directory viewing

@method preview
@param {object} arg arguments
@param {object} arg.body Express POST variables
@param {string} arg.body.folder Path to directory
@param {object} arg.response
@param {object} arg.request
@return {undefined}
**/
module.exports.preview = function (arg) {
	var directory = require("../js/admin-directory-contents-api.js"),
		response,
		request;
	if (arg === undefined) {
		throw new ReferenceError(_error.missingArg);
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
			if (constant.config.debug && constant.config.debug === true) {
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
				var sourcePath = path.dirname(__dirname) + item.path.abs,
					outputPath,
					filename = item.name + item.ext;
				if (constant.config.tempThumbFolder) {
					outputPath = sourcePath + constant.config.tempThumbFolder + "/";
				} else {
					outputPath = sourcePath;
				}
				if (constant.config.debug && constant.config.debug === true) {
					console.log("ifImage: filename="+filename+"; outputPath="+outputPath+";");
				}

				require('mkdirp')(outputPath, function (errorNewPath) {
					if (errorNewPath) {
						throw errorNewPath;
					}

					if (require('fs').existsSync(outputPath + filename)) { // file exists
						if (constant.config.debug && constant.config.debug === true) {
							console.log("createThumb: file exists:" + outputPath + filename + ";");
						}
						afterThumbCreated();
						return;
					}
					if (constant.config.debug && constant.config.debug === true) {
						console.log("ifImage resize image: filename="+filename+";");
					}

					require('gm')(sourcePath + filename)
						.resize(dimension.width, dimension.height + ">")
						.gravity('Center')
						.extent(dimension.width, dimension.height)
						.write(outputPath + filename, afterThumbCreated);
				});
			}
			if (item.content.type === "image") {
				if (constant.config.debug && constant.config.debug === true) {
					console.log("ifImage; start create thumb");
				}
				createThumb(item);
				if (constant.config.tempThumbFolder) {
					out.push(constant.config.tempThumbFolder + "/" + item.name + item.ext);
				} else {
					out.push(item.name + item.ext);
				}
			} else {
				if (constant.config.debug && constant.config.debug === true) {
					console.log("ifImage; file type="+item.content.type+";");
				}
				afterThumbCreated();
			}
		}
		function addToQueue() {
			var item = json.items[count.imageInitiated];
			if (item === undefined) {
				return;
			}
			queue.push(item, function (errorEach) {
				if (errorEach) {
					throw errorEach;
				}
				var filename = item.name + item.ext;
				console.log("Thumbnail processed: " + filename + ";");
			});
		}
		queue = require("async").queue(function (item, callback) {
			var filename = item.name + item.ext;
			if (constant.config.debug && constant.config.debug === true) {
				console.log("Asynce queue item:"+filename+";");
			}
			ifImage(item);
			callback();
		}, 3);
		addToQueue();
	}

	directory.getContents(
		{
			"folder": decodeURIComponent(request.body.folder)
		},
		ensureShrunkImages
	);
};

/***
*     #######                                    
*     #       #    #  ####  #    # #####  ###### 
*     #       ##   # #      #    # #    # #      
*     #####   # #  #  ####  #    # #    # #####  
*     #       #  # #      # #    # #####  #      
*     #       #   ## #    # #    # #   #  #      
*     ####### #    #  ####   ####  #    # ###### 
*                                                
*/
/**
Create directory or use existing directory

@method ensureDestinationFolder
@param {object} arg arguments
@param {string} arg.targetFolderName Destination folder's name for this photo batch
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
	if (arg.targetFolderName === undefined) {
		throw new ReferenceError(_error.missingArgFolderName);
	}
	destinationPath = arg.destinationRootPath || (path.dirname(__dirname) + '/' + constant.config.resizeFolder + '/');

	function createOrVerifyFolder(folder) {
		var folderPath = destinationPath + folder + '/' + arg.targetFolderName;
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

/***
*     ######                                       ######                      
*     #     # ###### #      ###### ##### ######    #     #   ##   ##### #    # 
*     #     # #      #      #        #   #         #     #  #  #    #   #    # 
*     #     # #####  #      #####    #   #####     ######  #    #   #   ###### 
*     #     # #      #      #        #   #         #       ######   #   #    # 
*     #     # #      #      #        #   #         #       #    #   #   #    # 
*     ######  ###### ###### ######   #   ######    #       #    #   #   #    # 
*                                                                              
*/
/**
Delete path (file or folder)

@method deletePath
@param {object} arg arguments
@param {string} arg.request.body.path || arg.request.body.tempThumbFolder
**/
function _deletePath(arg, unitTestCallback) {
	var errors = [],
		response,
		request,
		targetPath;
	if (arg === undefined) {
		throw new ReferenceError(_error.missingArg);
	}
	if (arg.request === undefined || arg.request.body === undefined) {
		throw new ReferenceError(_error.missingArgTargetPath);
	}
	if (arg.request.body.path === undefined) {
		if (arg.request.body.tempThumbFolder === undefined) {
			throw new ReferenceError(_error.missingArgTargetPath);
		} else {
			targetPath = path.join(arg.request.body.tempThumbFolder, constant.config.tempThumbFolder);
		}
	} else {
		targetPath = path.join(arg.request.body.path);
	}
	response = arg.response;
	request = arg.request;
	targetPath = path.join(path.dirname(__dirname), targetPath);
	targetPath = decodeURIComponent(targetPath);

	require('rimraf')(targetPath, function(err) {
		var out;
		if (err) {
			errors.push("Delete failed on this path: " + targetPath + "; with this error message:" + err + ";");
		}
		out = {
			"meta": {
				"error": {
					"count": errors.length,
					"message": errors.join('; ')
				}
			}
		};
		if (errors.length === 0) {
			out.meta.success = {
				"message": targetPath + " folder successfully deleted."
			};
		}
		response.writeHead(200, {'Content-Type': 'application/json'});
		response.end(JSON.stringify(out));
		if (unitTestCallback) {
			unitTestCallback();
		}
	});
}
module.exports.deletePath = _deletePath;


/***
*     #     #                         ######                                    
*     ##   ##  ####  #    # ######    #     # #    #  ####  #####  ####   ####  
*     # # # # #    # #    # #         #     # #    # #    #   #   #    # #      
*     #  #  # #    # #    # #####     ######  ###### #    #   #   #    #  ####  
*     #     # #    # #    # #         #       #    # #    #   #   #    #      # 
*     #     # #    #  #  #  #         #       #    # #    #   #   #    # #    # 
*     #     #  ####    ##   ######    #       #    #  ####    #    ####   ####  
*                                                                               
*/
/**
Move source photo to destination originals folder

@method movePhotos
@param {object} arg arguments
@param {string} [arg.destinationRootPath=resizeImages] Destination photo path excluding filename
@param {object} arg.assets { sort: ["2014-12-18"], "2014-12-18": { files: [ {moved: "", raw: "", renamed: "" } ] } }
@param {boolean} arg.moveToResize Change directory
@return {object} arg arguments
@return {string[]} arg.files Collection of before and after filename
**/
function _movePhotos(arg, callback) {
	var afterRename,
		beforeRename,
		callbackCount = 0,
		destinationPath,
		assets = [],
		fs = require('fs'),
		isMoveToResize,
		queue,
		year;
	if (arg === undefined) {
		throw new ReferenceError(_error.missingArg);
	}
	if (arg.assets === undefined) {
		throw new ReferenceError(_error.missingArgAssets);
	}
	if (arg.moveToResize === undefined) {
		throw new ReferenceError(_error.missingArgMove);
	}

	destinationPath = arg.destinationRootPath || (path.dirname(__dirname) + '/' + constant.config.resizeFolder + '/originals/');
	destinationPath = decodeURIComponent(destinationPath);
	isMoveToResize = (arg.moveToResize === "true" || arg.moveToResize === true);

	if (isMoveToResize === true) {
		year = arg.assets.sort[0].substring(0, 4);
		_ensureDestinationFolder({"targetFolderName": year});
	}

	arg.assets.sort.forEach(function (id) {
		arg.assets[id].files.forEach(function (file) {
			beforeRename = decodeURIComponent(file.raw);
			afterRename = (isMoveToResize) ? destinationPath + file.moved : file.renamed;
			afterRename = decodeURIComponent(afterRename);

			if (constant.config.debug === true) {
				console.log("_movePhotos: beforeRename(" + beforeRename + "); afterRename(" + afterRename + ")");
			}

			if (beforeRename === undefined || beforeRename === "" || afterRename === undefined || afterRename === "") {
				throw new TypeError(_error.emptyRenameFile);
			}
			assets.push({
				"destination": {
					"moved": isMoveToResize,
					"path": {
						"type": "absolute",
						"value": afterRename
					}
				},
				"mediaType": file.mediaType,
				"source": {
					"path": {
						"type": "relative",
						"value": beforeRename
					}
				}
			});
		});
	});

	function possibleCallback() { // calculate if all async calls are complete
		callbackCount++;
		
		if (callbackCount === (assets.length + 1)) { // +1 for drain
			callback({"assets": assets});
		}
	}

	queue = require("async").queue(function (file, errorCallback) {
		var destinationPath = file.destination.path.value,
			sourcePath = file.source.path.value;
		fs.exists(sourcePath, function (exists) {
			if (exists) {
				fs.rename(sourcePath, destinationPath, function (warningRename) {
					if (warningRename) {
						console.log("Image renaming warning (_movePhotos): " + warningRename + "; Before filename=" + sourcePath + "; After filename=" + destinationPath + ";");
					}
					possibleCallback();
				});
				errorCallback();
			} else {
				console.log("Image does not exist (_movePhotos): " + sourcePath + ";");
			}
		});
	}, 1);

	queue.push(assets, function(errorEach){
		if (errorEach) {
			throw errorEach;
		}
	});
	queue.drain = possibleCallback;
}
module.exports.movePhotos = _movePhotos;

/***
*     ######                                
*     #     # ######  ####  # ###### ###### 
*     #     # #      #      #     #  #      
*     ######  #####   ####  #    #   #####  
*     #   #   #           # #   #    #      
*     #    #  #      #    # #  #     #      
*     #     # ######  ####  # ###### ###### 
*                                           
*/
/**
Resize solo photo into originals, photos, thumbs folder

@method resize
@param {object} arg arguments
@param {string} arg.targetFolderName Folder to become child of originals, photos, and thumbs
**/
module.exports.resize = function (arg) {
	var filename,
		gm = require('gm'),
		photo = { width: 800, height: 600 },
		response = arg.response,
		request = arg.request,
		thumb = { width: 185, height: 45 };
	if (arg === undefined) {
		throw new ReferenceError(_error.missingArg);
	}
	if (request.body === undefined || request.body.destination === undefined) {
		throw new ReferenceError(_error.missingArgDestination);
	}

	function transformImage (originalPath) {
		gm(originalPath)
			.autoOrient()
			.stream(function (errOrient, stdout) { // stderr is third param
				var callbackCount = 0,
					callbackTotal = 2,
					errors = [],
					photoPath = originalPath.replace("/originals/", '/photos/'),
					thumbPath = originalPath.replace("/originals/", '/thumbs/');

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
									}
								},
								"payload": {
									"paths": {
										"original": originalPath,
										"photo": photoPath,
										"thumb": thumbPath
									}
								}
							}
						));
					}
				}

				gm(stdout)
					.resize(photo.width, photo.height)
					.write(photoPath, function (errResize) {
						if (errResize) {
							errors.push('Photo resize write error: ' + errResize);
						}
						possibleCompletion();
					})
				;

				gm(stdout)
					.resize(thumb.width, thumb.height, "!")
					.noProfile()
					.write(thumbPath, function (errResize) {
						if (errResize) {
							errors.push('Thumbnail resize write error: ' + errResize);
						}
						possibleCompletion();
					})
				;
			})
		;
	}

	filename = request.body.destination.path.value;
	transformImage(filename);
};

/***
*     ######                                     
*     #     # ###### #    #   ##   #    # ###### 
*     #     # #      ##   #  #  #  ##  ## #      
*     ######  #####  # #  # #    # # ## # #####  
*     #   #   #      #  # # ###### #    # #      
*     #    #  #      #   ## #    # #    # #      
*     #     # ###### #    # #    # #    # ###### 
*                                                
*/
/**
Rename and move images

@method rename
@param {object} arg arguments
@param {object} arg.response Express response object
@param {object} arg.request Express request object
@param {object} arg.request.body Express POST object
@param {} arg.request.body.assets See movePhotos
@param {boolean} arg.request.body.moveToResize See movePhotos
**/
module.exports.rename = function (arg, unitTestCallback) {
	var response,
		request;
	if (arg === undefined) {
		throw new ReferenceError(_error.missingArg);
	}
	if (arg.response === undefined) {
		throw new ReferenceError(_error.missingArgResponse);
	}
	if (arg.request === undefined) {
		throw new ReferenceError(_error.missingArgRequest);
	}
	if (arg.request.body === undefined || arg.request.body.assets === undefined || arg.request.body.assets.sort === undefined) {
		throw new ReferenceError(_error.missingArgAssets);
	}
	if (arg.request.body.moveToResize === undefined) {
		throw new ReferenceError(_error.missingArgMove);
	}
	response = arg.response;
	request = arg.request;

	_movePhotos(
		request.body,
		function (payload) {
			if (unitTestCallback) {
				unitTestCallback(payload);
			} else {
				response.writeHead(200, {'Content-Type': 'application/json'});
				response.end(JSON.stringify(payload));
			}
		}
	);
};
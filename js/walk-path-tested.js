/*global define, module, window*/
var _error = {
	"missingArg": "Missing required argument",
	"missingArgDayCount": "Missing required argument photos in a day count",
	"missingArgPrefix": "Missing required argument file prefix",
	"missingArgQuerystring": "Missing required argument query-string"
};
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
	module.exports.error = _error;
} else {
	if (typeof define === 'function' && define.amd) {
		define([], function() {
			return _error;
		});
	} else {
		if (!window.walkPath) {
			window.walkPath = {};
		}
		window.walkPath.error = _error;
	}
}

/**
Generate renamed files

@method getRenamedFiles
@param {object} arg arguments
@param {string} arg.filePrefix Root of filename with increment added before extension
@param {integer} arg.photosInDay Root of filename with increment added before extension
@return {undefined}
**/
function _getRenamedFiles(arg) {
	if (arg === undefined) {
		throw new ReferenceError(_error.missingArg);
	}
	if (arg.filePrefix === undefined) {
		throw new ReferenceError(_error.missingArgPrefix);
	}
	if (arg.photosInDay === undefined || arg.photosInDay === 0) {
		throw new ReferenceError(_error.missingArgDayCount);
	}
	var prefix = arg.filePrefix,
		photosInDay = arg.photosInDay,
		idStart = arg.xmlStartPhotoId || 1,
		firstPhotoNum = 10, // 1-9 are reserved for future photo additions
		lastPhotoNum = 90, // 91-99 are reserved for future photo additions
		file,
		filename,
		i,
		maxRange = lastPhotoNum - firstPhotoNum + 1, //  +1 to include both #s in the range
		spread = [],
		increment = maxRange / photosInDay,
		incrementInt = parseInt(increment, 10),
		incrementFloat = increment - incrementInt,
		buildUp,
		idLoop,
		photoIncrement,
		possibleLast,
		prevBuildUp,
		files = [],
		filenames = [],
		xml = '';
	idStart = parseInt(idStart, 10);

	for (i = 1; i <= photosInDay; i += 1) {
		buildUp = parseInt(incrementFloat * i, 10);
		if (i === 1 && i === photosInDay) { // only ONE photo
			photoIncrement = 50;
		} else if (i === 1) {
			photoIncrement = firstPhotoNum + incrementInt + buildUp;
		} else if (i === photosInDay) {
			possibleLast = photoIncrement + incrementInt + buildUp - prevBuildUp;
			if (possibleLast < lastPhotoNum) {
				photoIncrement = possibleLast;
			} else {
				photoIncrement = lastPhotoNum;
			}
		} else {
			photoIncrement += incrementInt + buildUp - prevBuildUp;
		}
		prevBuildUp = buildUp;
		spread.push(photoIncrement);
	}
	for (i = 0, idLoop = idStart; i < spread.length; i += 1) {
		file = prefix + '-' + ((spread[i] < 10) ? '0' + spread[i] : spread[i]).toString();
		files.push(file);
		filename = file + ".jpg";
		filenames.push(filename);
		xml += '<photo id="' + idLoop + '"><filename>' + filename + '</filename></photo>';
		idLoop += 1;
	}
	return {"filenames": filenames, "files": files, "xml": xml};
}
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
	module.exports.getRenamedFiles = _getRenamedFiles;
} else {
	if (typeof define === 'function' && define.amd) {
		define([], function() {
			return _getRenamedFiles;
		});
	} else {
		if (!window.walkPath) {
			window.walkPath = {};
		}
		window.walkPath.getRenamedFiles = _getRenamedFiles;
	}
}

function _setParentFolderLink(arg) {
	var key,
		href = "",
		isFolderEmpty,
		name = "",
		newQs = [],
		out = {"href": '', "text": ''},
		path = [];
	if (arg === undefined) {
		throw new ReferenceError(_error.missingArg);
	}
	if (arg.querystring === undefined) {
		throw new ReferenceError(_error.missingArgQuerystring);
	}
	isFolderEmpty = (arg.querystring.folder === undefined || arg.querystring.folder === "");
	if (!isFolderEmpty) {
		path = arg.querystring.folder.split("/");
		name = path.pop();
		if (name === "") {
			path.pop();
		}
		if (path[path.length - 1] === undefined) {
			//name = (path.length === 0) ? "/" : "";
			name = "/";
		} else {
			name = path[path.length - 1];
		}
	}
	out.text = decodeURIComponent(name);
	for (key in arg.querystring) {
		if (key === "folder") {
			newQs.push(key + "=" + path.join("/") + ((path.length > 0) ? "/" : ""));
		} else {
			newQs.push(key + "=" + arg.querystring[key]);
		}
	}
	if (newQs.length > 0) {
		out.href = "?" + newQs.join("&");
	}
	return out;
}
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
	module.exports.setParentFolderLink = _setParentFolderLink;
} else {
	if (typeof define === 'function' && define.amd) {
		define([], function() {
			return _setParentFolderLink;
		});
	} else {
		if (!window.walkPath) {
			window.walkPath = {};
		}
		window.walkPath.setParentFolderLink = _setParentFolderLink;
	}
}
/*global define, module, window*/
var error = {
	"missingArg": "Missing required argument",
	"missingArgDayCount": "Missing required argument photos in a day count",
	"missingArgPrefix": "Missing required argument file prefix"
};
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
	module.exports.error = error;
} else {
	if (typeof define === 'function' && define.amd) {
		define([], function() {
			return error;
		});
	} else {
		if (!window.resizeRenamePhotos) {
			window.resizeRenamePhotos = {};
		}
		window.resizeRenamePhotos.error = error;
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
function getRenamedFiles(arg) {
	if (arg === undefined) {
		throw new ReferenceError(error.missingArg);
	}
	if (arg.filePrefix === undefined) {
		throw new ReferenceError(error.missingArgPrefix);
	}
	if (arg.photosInDay === undefined || arg.photosInDay === 0) {
		throw new ReferenceError(error.missingArgDayCount);
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
	module.exports.getRenamedFiles = getRenamedFiles;
} else {
	if (typeof define === 'function' && define.amd) {
		define([], function() {
			return getRenamedFiles;
		});
	} else {
		if (!window.resizeRenamePhotos) {
			window.resizeRenamePhotos = {};
		}
		window.resizeRenamePhotos.getRenamedFiles = getRenamedFiles;
	}
}
/*global define, module, window*/
'use strict';
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

function _setParentFolderLink(arg) {
	var key,
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
		path = path.filter(function(n){ return n !== ""; }); // remove empty elements
		name = path[path.length - 2] || "/";
	}
	out.text = decodeURIComponent(name);
	for (key in arg.querystring) {
		if (key === "folder") {
			path.pop();
			if (path.length > 0) {
				newQs.push(key + "=/" + path.join("/"));
			}
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

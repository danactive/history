/*global window*/
/*exported ajaxError, requireArg*/
var ajaxError = function(jqXHR, textStatus, errorThrown) {/*jshint unused:false */ debugger; /* run as localhost */ },
	util = window.util || {};

util.dateObjFormat = function (date) {
	// in - JS date object
	// out - yyyy-mm-dd
	var yyyy = date.getFullYear().toString(),
	m = (date.getMonth() + 1).toString(),
	mm = (m.length === 1) ? '0' + m : m,
	d = date.getDate().toString(),
	dd = (d.length === 1) ? '0' + d : d;

	return [yyyy, mm, dd].join('-');
};
util.queryObj = function () { // usage var myParam = queryObj()["myParam"];
	var result = {};
	if (window.location.search === "") {
		return {};
	}
	window.location.search.slice(1).split('&').forEach(function(keyValuePair) {
		keyValuePair = keyValuePair.split('=');
		result[keyValuePair[0]] = keyValuePair[1] || '';
	});

	return result;
};
function requireArg(params) {
	function testType() {
		switch (params.type) {
			case "array":
				if (typeof params.args[params.name] === "object" && params.args[params.name].length) {
					return;
				}
				break;
			case "boolean":
				if (typeof params.args[params.name] === "boolean") {
					return;
				}
				break;
			case "function":
				if (typeof params.args[params.name] === "function") {
					return;
				}
				break;
			case "number":
				if (typeof params.args[params.name] === "number") {
					return;
				}
				break;
			case "string":
				if (typeof params.args[params.name] === "string") {
					return;
				}
				break;
		}
		throw new TypeError("Type mismatch '" + params.name + "' must be a '" + params.type + "';");
	}
	if (params.args[params.name] === undefined || params.args[params.name] === null) {
		throw new ReferenceError("Required argument '" + params.name + "';");
	}
	testType();
	return params.args[params.name];
}
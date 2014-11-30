/*global module, require */

module.exports = function (param) {
	var files = require('fs').readdirSync('.'),
		galleries = [],
		i,
		json,
		len = files.length,
		response;

	for (i = 0; i < len; i++) {
		if (files[i].indexOf('gallery-') === 0) {
			galleries.push(files[i].substr(8));
		}
	}

	json = { "galleries": galleries };

	if (param && param.jsonHeader && param.jsonHeader === true) {
		response = param.response;
		response.writeHead(200, {'Content-Type': 'application/json'});
		response.end(JSON.stringify( json ));
	} else {
		return json;
	}
};
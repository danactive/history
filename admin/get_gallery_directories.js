var fs = require('fs');

exports.init = function (param) {
	var response = param.response,
		request = param.request,
		files = fs.readdirSync('.'),
		i,
		len = files.length,
		galleries = [],
		json;

	for (i = 0; i < len; i++) {
		if (files[i].indexOf('gallery-') === 0) {
			galleries.push(files[i].substr(8));
		}
	}

	json = { "galleries": galleries };

	if (param.forNode === true) {
		return json;
	} else {
		response.writeHead(200, {'Content-Type': 'application/json'});
		response.end(JSON.stringify( json ));
	}
}
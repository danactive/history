/*global exports, require*/

exports.init = function (param) {
	var response = param.response,
		request = param.request;

	response.writeHead(200, {'Content-Type': 'application/json'});
	response.end(JSON.stringify({"hello": 'world', "var2": request.param('folder')}));
};
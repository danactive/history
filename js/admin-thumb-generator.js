/*global exports, require*/

exports.init = function (arg) {
	var directory = require("../js/admin-directory-contents-api.js"),
		response = arg.response,
		request = arg.request;

	response.writeHead(200, {'Content-Type': 'application/json'});
	directory.getContents({"folder": decodeURIComponent(request.body.folder)}, function (arg) {
		var json,
			out = [];
		if (arg.error) {
			throw arg.error;
		}
		json = directory.generateJson(arg);

		json.items.forEach(function (item) {
			if (item.content.type === "image") {
				out.push("Create thumb of " + item.name);
			}
		});
		response.end(JSON.stringify({"out":out}));
	});
};
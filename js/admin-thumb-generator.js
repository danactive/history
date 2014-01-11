/*global __dirname, exports, require*/

exports.init = function (arg) {
	var constant = arg.constant,
		directory = require("../js/admin-directory-contents-api.js"),
		response = arg.response,
		request = arg.request;

	directory.getContents({"folder": decodeURIComponent(request.body.folder)}, function (arg) {
		var dimension = {"width": 200, "height": 200},
			count = {
				"imageLoop": 0,
				"thumbCreated": 0
			},
			json = directory.generateJson(arg),
			out = [],
			queue;
		if (arg.error) {
			throw arg.error;
		}
		function possibleOutput() {
			var done = false;
			if (count.imageLoop === 0) { // no images in this directory
				done = true;
			} else if (count.thumbCreated === count.imageLoop) {
				done = true;
			}
			if (done === true) {
				response.writeHead(200, {'Content-Type': 'application/json'});
				response.end(JSON.stringify({"thumbnails":out}));
			}
		}
		function ifImage(item) {
			function createThumb(item) {
				var sourcePath = require('path').dirname(__dirname) + "/" + item.path.abs,
					outputPath = sourcePath + constant.tempThumbFolder + "/",
					filename = item.name + item.ext;

				require('mkdirp')(outputPath, function (errorNewPath) {
					if (errorNewPath) {
						throw errorNewPath;
					}

					if (require('fs').existsSync(outputPath + filename)) { // file exists
						count.thumbCreated++;
						possibleOutput();
						return;
					}
					require('gm')(sourcePath + filename)
						.resize(dimension.width, dimension.height + ">")
						.gravity('Center')
						.extent(dimension.width, dimension.height)
						.write(outputPath + filename, function (errorWriting) {
							if (errorWriting) {
								throw errorWriting;
							}
							count.thumbCreated++;
							possibleOutput();
						});
				});
			}
			if (item.content.type === "image") {
				count.imageLoop++;
				createThumb(item);
				out.push(constant.tempThumbFolder + "/" + item.name + item.ext);
			}
		}
		queue = require("async").queue(function (item, callback) {
			ifImage(item);
			callback();
		}, 1);

		queue.push(json.items, function(errorEach){
			if (errorEach) {
				throw errorEach;
			}
		});
		queue.drain = possibleOutput;
	});
};
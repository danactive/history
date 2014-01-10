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
			fs = require('fs'),
			gm = require('gm'), // image processer
			json,
			mkdirp = require('mkdirp'), // create folder,
			path = require('path'),
			out = [];
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
		function createThumb(item) {
			var sourcePath = path.dirname(__dirname) + "/" + item.path.abs,
				outputPath = sourcePath + constant.tempThumbFolder + "/",
				filename = item.name + item.ext;

			mkdirp(outputPath, function (errorNewPath) {
				if (errorNewPath) {
					throw errorNewPath;
				}

				if (fs.existsSync(outputPath + filename)) { // file exists
					count.thumbCreated++;
					possibleOutput();
					return;
				}
				gm(sourcePath + filename)
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
		json = directory.generateJson(arg);
		json.items.forEach(function (item) {
			if (item.content.type === "image") {
				createThumb(item);
				out.push(constant.tempThumbFolder + "/" + item.name + item.ext);
				count.imageLoop++;
			}
		});
		possibleOutput();
	});
};
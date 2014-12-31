"use strict";
var harnesses = [];

harnesses.push({
	"route": "flickr?lat=49.25&lon=-123.1",
	"data": require("./credentials.js"),
	"view": {
		"path": "flickr_gallery.dust"
	}
});

harnesses.push({
	"route": "walk-path",
	"data": "http://localhost:8000/template/walk-path",
	"view": {
		"path": "harness/directory_contents.dust"
	}
});


module.exports = {
	"register": {
		"port": 8001,
		"static": {
			"route": "/",
			"directory": "/public"
		},
		"view": {
			"dust": {
				"path": "src/views"
			}
		}
	},
	"harnesses": harnesses
};
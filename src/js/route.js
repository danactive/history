/*global exports, require*/
'use strict';

exports.register = function(server, options, next) {
	var admin = require("./controllers/admin.js"),
		files = require("./controllers/static.js"),
		root = require("./controllers/root.js"),
		routes = [];

	routes.push({ "method": 'GET',  "path": '/api/getGalleries', "config": admin.apiGetGalleries });
	routes.push({ "method": 'GET',  "path": '/admin/walk-path', "config": admin.adminWalkPath });
	routes.push({ "method": 'GET',  "path": '/api/walk-path', "config": admin.apiWalkPath });
	routes.push({ "method": 'GET',  "path": '/template/walk-path', "config": admin.templateWalkPath });
	routes.push({ "method": 'GET',  "path": '/admin/diff-album-path', "config": admin.adminDiffAlbumPath });
	routes.push({ "method": 'GET',  "path": '/admin/preview-generator', "config": admin.previewGenerator });
	routes.push({ "method": 'POST', "path": '/admin/delete-path', "config": admin.deletePath });

	routes.push({ "method": 'GET',  "path": '/admin/{files*}', "config": files.admin });
	routes.push({ "method": 'GET',  "path": '/static/{path*}', "config": files.static });
	routes.push({ "method": 'GET',  "path": '/static/gallery-{gallery}/{files*}', "config": files.gallery });
	routes.push({ "method": 'GET',  "path": '/public/{files*}', "config": files.public });
	routes.push({ "method": 'GET',  "path": '/favicon.ico', "handler": { "file": './favicon.ico' } });

	routes.push({ "method": 'GET',  "path": '/flickr-gallery', "config": root.flickrGallery });
	routes.push({ "method": '*',    "path": '/{p*}', "config": root.notFound });

	server.route(routes);

	next();
};

exports.register.attributes = {
	pkg: require('../../package.json')
};

/*global module*/
'use strict';
var route = {};

route.admin = {
	description: 'Admin landing page',
	tags: ['hapi'],
	handler: {
		directory: {
			path: "admin",
			listing: false,
			index: true,
			redirectToSlash: true
		}
	}
};

route.static = {
	description: 'Static assets like JS, CSS, images files',
	tags: ['hapi'],
	handler: {
		directory: {
			path: "public",
			listing: true,
			index: false,
			redirectToSlash: true
		}
	}
};

route.gallery = {
	description: 'Gallery XML',
	tags: ['hapi'],
	handler: {
		directory: {
			path: function (request) {
				return "gallery-" + request.params.gallery;
			},
			listing: true,
			index: false,
			redirectToSlash: true
		}
	}
};

route.public = {
	description: 'Minified JavaScript libraries for the browser',
	tags: ['hapi'],
	handler: {
		directory: {
			path: "public",
			listing: true,
			index: false,
			redirectToSlash: true
		}
	}
};

module.exports = route;

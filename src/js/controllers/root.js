'use strict';
var joi = require("joi"),
	route = {};

route.flickrGallery = {
	description: 'Flickr full justified gallery',
	tags: ['hapi'],
	handler: function (request, reply) {
		var credentials = require("../../../credentials.js");
		reply.view('src/views/flickr_gallery.dust', credentials);
	},
	validate: {
		query: {
			lat: joi.number().min(-90).max(90),
			lon: joi.number().min(-180).max(180)
		}
	}
};

route.home = {
	description: 'Home landing page',
	tags: ['hapi'],
	handler: function (request, reply) {
		require('../directory_contents.js').getGalleries(function (response) {
			reply.view('src/views/home.dust', response.payload);
		});
	},
	validate: {
		query: {}
	}
};

route.notFound = {
	description: 'Catch all route',
	tags: ['hapi'],
	handler: function (request, reply) {
		reply("bad route").code(404);
	}
};

module.exports = route;

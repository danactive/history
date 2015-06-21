'use strict';
var joi = require("joi"),
	route = {};

route.flickrGallery = {
	description: 'Flickr full justified gallery',
	tags: ['hapi'],
	handler: function (request, reply) {
		var credentials = require("../../../credentials.js");
		reply.view('flickr_gallery.dust', credentials);
	},
	validate: {
		query: {
			lat: joi.number().min(-180).max(180),
			lon: joi.number().min(-90).max(90)
		}
	}
};

route.home = {
	description: 'Home landing page',
	tags: ['hapi'],
	handler: function (request, reply) {
		require('../directory_contents.js').getGalleries(function (response) {
			reply.view('home.dust', response.payload);
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

route.watchVideo = {
	description: 'Watch HTML5 videos',
	tags: ['hapi'],
	handler: function (request, reply) {
		reply.view('video.dust');
	},
	validate: {
		query: {
			videos: joi.string(),
			w: joi.number(),
			h: joi.number(),
			gallery: joi.string()
		}
	}
};

module.exports = route;

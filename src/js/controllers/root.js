'use strict';
var ig = require('instagram-node').instagram();
var joi = require("joi"),
  //ig = require('instagram-node').instagram(),
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
console.log('root.js');
route.instaGallery = {
	description: 'Instagram full justified gallery',
	tags: ['hapi'],
	handler: function (request, reply) {
		var credentials = require("../../../credentials.js");

    console.log('pre ig use');

    ig.use({
      access_token: '1449178229.53cbd33.5fe02c44297a45b7b71cd74093aa51f9'
      /*client_id: credentials.instagram.client_id,
      client_secret: credentials.instagram.client_secret,*/
    });

    console.log('post ig use');
    console.log('pre ig loc search');
    ig.location_search({ lat: 48.565464564, lng: 2.34656589 }, function (err, result, remaining, limit) {
      if (err) {
        //reply(`Error found ${err.message}`);
        return;
      }

      console.log('callback ig loc search');
      console.log(result);

      reply(result);
    });
    console.log('post ig loc search');
    //reply(result)
		//reply.view('src/views/instagram_gallery.dust', credentials);
	},
	validate: {
		query: {
			lat: joi.number().min(-90).max(90),
			lon: joi.number().min(-180).max(180)
		}
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

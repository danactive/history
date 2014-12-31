/*global __dirname, console, require*/
(function () {
	'use strict';

	var hapi = require('hapi'),
		notifier = require('node-notifier'),
		server = new hapi.Server();

	server.connection({ "port": 8000 });

	server.register([
		{ "register": require('lout') },
		{ "register": require('./route.js') }
	], function () {
		var dust = require('dustjs-linkedin'),
			dustViews = require("fs").readFileSync("./public/views.min.js");
		require("tuxharness");
		dust.loadSource(dustViews);
		console.log('Views loaded to cache');

		server.start();
		console.log('Server running at ' + server.info.uri);
		notifier.notify({
            title: 'Server event',
            message: 'Running at ' + server.info.uri
        });
	});

	server.views({
		"defaultExtension": "dust",
		"engines": {
			"dust": require('hapi-dust')
		},
		"isCached": true,
		"path": '../views',
		"partialsPath": '../views',
		"relativeTo": __dirname
	});
})();
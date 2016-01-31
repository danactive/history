/* global exports */

'use strict';

exports.register = function (server, options, next) {
    server.route({
        method: 'POST',
        path: '/rename',
        config: {
            handler: function (request, reply) {
                reply('test passed');
            },
            tags: ["api"]
        }
    });

    next();
};

exports.register.attributes = {
    name: 'rename',
    version: '0.1.0'
};
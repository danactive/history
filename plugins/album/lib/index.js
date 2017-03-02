/* global jQuery, __dirname, require, location */

const json = require('./json');
const validation = require('../../../lib/validation');
const instagram = require('instagram-node');
const instagramjs = require('../public/instagram');


const handler = (request, reply) => {
  const albumStem = request.query.album_stem;
  const gallery = request.query.gallery;
  const raw = request.query.raw;

  json.getAlbum(gallery, albumStem)
    .then(albumData => (raw ? reply(albumData) : reply.view('plugins/album/views/page.jsx', albumData)))
    .catch(error => reply(error));
};

exports.register = (server, options, next) => {
  server.route({
    method: 'GET',
    path: '/album',
    config: {
      handler,
      tags: ['api', 'plugin'],
      validate: {
        query: {
          album_stem: validation.albumStem,
          gallery: validation.gallery,
          raw: validation.raw,
        },
      },
    },
  });

  server.route({
    method: 'GET',
    path: '/album/static/{path*}',
    config: {
      description: 'Static assets like JS, CSS, images files',
      handler: {
        directory: {
          path: 'plugins/album/public',
          listing: true,
          index: false,
          redirectToSlash: true,
        },
      },
    },
  });

  server.route({
    method: 'GET',
    path: '/album/static/utils.js',
    config: {
      description: 'Utility script',
      handler: {
        file: 'plugins/utils/public/utils.js',
      },
    },
  });

  server.route({
    method: 'GET',
    path: '/album/static/jquery.js',
    config: {
      description: 'jQuery library',
      tags: ['jQuery'],
      handler: {
        file: 'plugins/utils/public/lib/jquery/dist/jquery.min.js',
      },
    },
  });

  server.route({
    method: 'GET',
    path: '/album/bundle.js',
    config: {
      handler: {
        file: 'plugins/album/public/assets/bundle.js',
      },
    },
  });
  const ig = instagram.instagram();
  const redirectLandingAddress = 'http://localhost:8000/view/instagram-login';
  const clientId = '53cbd338e38643ba96179cdb50a333a3';
  const clientSecret = '8225835440eb4689b1632b808d5ccea7';
  let accessToken = '1449178229.53cbd33.5fe02c44297a45b7b71cd74093aa51f9';
  server.route({
    method: 'GET',
    path: '/instagram-login',
    handler: (request, reply) => {
      if (request.query.code) {
        ig.authorize_user(request.query.code, redirectLandingAddress, (authError, result) => {
          if (authError) {
            reply(`Error found ${authError.message}`);
            return;
          }
          accessToken = result.access_token;
          ig.use({
            access_token: accessToken,
            client_secret: clientSecret,
          });

          // instagramjs.getLocation();
          // const lat = location.lat;
          // const lon = location.lon;

          ig.media_search(48.4335645654, 2.345645645, (err, medias) => {
            if (err) {
              reply(`Error found ${err.message}`);
              return;
            }
            console.log(medias);
            reply(medias);
          });
        });
      } else {
        ig.use({
          client_id: clientId,
          client_secret: clientSecret,
        });

        reply()
          .redirect(ig.get_authorization_url(redirectLandingAddress, { scope: ['public_content'] }));
      }
    },
  });

  server.route({
    method: 'GET',
    path: '/instagram',
    handler: (request, reply) => {
      ig.use({
        access_token: accessToken,
        client_secret: clientSecret,
      });
      instagramjs.getLocation();
      const lat = location.lat;
      const lon = location.lon;
      console.log(lat);
      ig.media_search(lat, lon, (err, medias) => {
        if (err) {
          reply(`Error found ${err.message}`);
          return;
        } reply(medias);
      });
    },
  });

  next();
};

exports.register.attributes = {
  name: 'history-view-album',
  version: '0.3.0',
};

/* global __dirname, require*/

const hapi = require('hapi');
const hapiReactViews = require('hapi-react-views');
const hapiSwagger = require('hapi-swagger');
const hoek = require('hoek');
const lout = require('lout');
const notifier = require('node-notifier');
const inert = require('inert');
const vision = require('vision');
const instagram = require('instagram-node');

require('tuxharness');

const config = require('./config.json');
const libAdmin = require('./plugins/admin/lib/index');
const viewAlbum = require('./plugins/album/lib/index');
const editAlbum = require('./plugins/editAlbum/lib/index');
const libGallery = require('./plugins/gallery/lib/index');
const libGeojson = require('./plugins/geojson/lib/index');
const libHome = require('./plugins/home/lib/index');
const libRename = require('./plugins/rename/lib/index');
const libResize = require('./plugins/resize/lib/index');
const libVideo = require('./plugins/video/lib/index');
const logMod = require('./plugins/log/lib/log');
const pkg = require('./package');

const credentials = require('./credentials.json');

require('babel-core/register')({
  presets: ['react', 'es2015'],
});

const port = config.port;
const log = logMod('server');
const server = new hapi.Server();
server.connection({ port });
server.register([
  { register: inert },
  { register: vision },
  { register: libAdmin, routes: { prefix: '/admin' } },
  { register: viewAlbum, routes: { prefix: '/view' } },
  { register: editAlbum, routes: { prefix: '/edit' } },
  { register: libGallery },
  { register: libGeojson, routes: { prefix: '/geojson' } },
  { register: libHome },
  { register: libRename, routes: { prefix: '/admin' } },
  { register: libResize, routes: { prefix: '/admin' } },
  { register: libVideo, routes: { prefix: '/view' } },
  {
    register: hapiSwagger,
    options: { info: { title: 'history API', version: pkg.version } },
  },
  { register: lout },
], (error) => {
  hoek.assert(!error, error);

  server.start();
  log.operational(`Server running at ${server.info.uri}`);
  notifier.notify({
    icon: `${__dirname}/favicon.ico`,
    title: 'Server event',
    message: `Running at ${server.info.uri}`,
  });
});

server.views({
  defaultExtension: 'jsx',
  engines: {
    jsx: hapiReactViews,
  },
  isCached: true,
  path: './',
  partialsPath: './',
  relativeTo: __dirname,
});

const ig = instagram.instagram();
const redirectLandingAddress = 'http://localhost:8080/api/instagram-login';

server.route({
  method: 'GET',
  path: '/api/instagram-login',
  handler: (request, reply) => {
    if (request.query.code) {
      ig.authorize_user(request.query.code, redirectLandingAddress, (authError, result) => {
        if (authError) {
          reply(`Error found ${authError.message}`);
          return;
        }

        credentials.instagram.access_token = result.access_token;

        ig.use({
          access_token: credentials.instagram.access_token,
          client_secret: credentials.instagram.client_secret,
        });

        // error, medias, pagination, remaining, limit
        ig.tag_media_recent('vancouver', { count: 10 }, (mediaError, media) => {
          if (mediaError) {
            reply(`Error found ${mediaError.message}`);
            return;
          }

          reply(media);
        });
      });
    } else {
      ig.use({
        client_id: credentials.instagram.client_id,
        client_secret: credentials.instagram.client_secret,
      });

      reply()
        .redirect(ig.get_authorization_url(redirectLandingAddress, { scope: ['public_content'] }));
    }
  },
});

server.route({
  method: 'GET',
  path: '/api/instagram',
  handler: (request, reply) => {
    ig.use({
      access_token: credentials.instagram.access_token,
      client_secret: credentials.instagram.client_secret,
    });

    // error, medias, pagination, remaining, limit
    ig.tag_media_recent('vancouver', { count: 10 }, (mediaError, media) => {
      if (mediaError) {
        reply(`Error found ${mediaError.message}`);
        return;
      }

      reply(media);
    });
  },
});

/* global __dirname, require*/

const dust = require('dustjs-linkedin');
const dustViews = require('fs').readFileSync('./public/views.min.js');
const hapi = require('hapi');
const hapiDust = require('hapi-dust');
const hapiReactViews = require('hapi-react-views');
const hapiSwagger = require('hapi-swagger');
const hoek = require('hoek');
const lout = require('lout');
const notifier = require('node-notifier');
const inert = require('inert');
const vision = require('vision');

require('tuxharness');

const libAlbum = require('./plugins/album/lib/index');
const libRename = require('./plugins/rename/lib/index');
const libResize = require('./plugins/resize/lib/index');
const libRoutes = require('./src/js/route.js');
const libVideo = require('./plugins/video/lib/index');
const logMod = require('./plugins/log/lib');
const pkg = require('./package');

require('babel-core/register')({
  presets: ['react', 'es2015'],
});

const log = logMod('server');
const server = new hapi.Server();
server.connection({ port: 8000 });
server.register([
  { register: inert },
  { register: vision },
  { register: libRoutes },
  { register: libAlbum, routes: { prefix: '/view' } },
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

  dust.loadSource(dustViews);
  log.operational('Views loaded to cache');

  server.start();
  log.operational(`Server running at ${server.info.uri}`);
  notifier.notify({
    title: 'Server event',
    message: `Running at ${server.info.uri}`,
  });
});

server.views({
  defaultExtension: 'dust',
  engines: {
    dust: hapiDust,
    jsx: hapiReactViews,
  },
  isCached: true,
  path: './',
  partialsPath: './',
  relativeTo: __dirname,
});

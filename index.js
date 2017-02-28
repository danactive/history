/* global __dirname, require*/

const hapi = require('hapi');
const hapiReactViews = require('hapi-react-views');
const hapiSwagger = require('hapi-swagger');
const hoek = require('hoek');
const lout = require('lout');
const notifier = require('node-notifier');
const inert = require('inert');
const vision = require('vision');

require('tuxharness');

const config = require('./config.json');
const libAdmin = require('./plugins/admin/lib/index');
const viewAlbum = require('./plugins/album/lib/index');
const editAlbum = require('./plugins/editAlbum/lib/index');
const libHome = require('./plugins/home/lib/index');
const libRename = require('./plugins/rename/lib/index');
const libResize = require('./plugins/resize/lib/index');
const libRoutes = require('./src/js/route.js');
const libVideo = require('./plugins/video/lib/index');
const logMod = require('./plugins/log/lib');
const pkg = require('./package');

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
  { register: libRoutes },
  { register: libAdmin, routes: { prefix: '/admin' } },
  { register: viewAlbum, routes: { prefix: '/view' } },
  { register: editAlbum, routes: { prefix: '/edit' } },
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

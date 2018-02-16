const hapiSwagger = require('hapi-swagger');
const inert = require('inert');
// const lout = require('lout');
const vision = require('vision');

const utils = require('../plugins/utils/index');

utils.env.load();

const libAdmin = require('../plugins/admin/lib/index');
const viewAlbum = require('../plugins/album/lib/index');
const editAlbum = require('../plugins/editAlbum/lib/index');
const exploreVideo = require('../plugins/exploreVideo/lib/index');
const libGallery = require('../plugins/gallery/lib/index');
const libGeojson = require('../plugins/geojson/lib/index');
const libHome = require('../plugins/home/lib/index');
const libPublic = require('../plugins/public/lib/index');
const libRename = require('../plugins/rename/lib/index');
const libResize = require('../plugins/resize/lib/index');
const libWalk = require('../plugins/walk/lib/index');
const libVideo = require('../plugins/video/lib/index');

const pkg = require('../../package');

const plugins = [
  inert,
  vision,
  { plugin: libAdmin, routes: { prefix: '/admin' } },
  { plugin: viewAlbum, routes: { prefix: '/view' } },
  { plugin: editAlbum, routes: { prefix: '/edit' } },
  { plugin: exploreVideo, routes: { prefix: '/explore' } },
  { plugin: libGallery },
  { plugin: libGeojson, routes: { prefix: '/geojson' } },
  { plugin: libHome },
  { plugin: libPublic },
  { plugin: libRename, routes: { prefix: '/admin' } },
  { plugin: libResize, routes: { prefix: '/admin' } },
  { plugin: libVideo, routes: { prefix: '/view' } },
  { plugin: libWalk },
  {
    plugin: hapiSwagger,
    options: { info: { title: 'history API', version: pkg.version } }
  }
  // { plugin: lout } doesn't support hapi 17 yet
];

module.exports = plugins;

const hapiSwagger = require('hapi-swagger');
const inert = require('inert');
const lout = require('lout');
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
  { register: inert },
  { register: vision },
  { register: libAdmin, routes: { prefix: '/admin' } },
  { register: viewAlbum, routes: { prefix: '/view' } },
  { register: editAlbum, routes: { prefix: '/edit' } },
  { register: exploreVideo, routes: { prefix: '/explore' } },
  { register: libGallery },
  { register: libGeojson, routes: { prefix: '/geojson' } },
  { register: libHome },
  { register: libPublic },
  { register: libRename, routes: { prefix: '/admin' } },
  { register: libResize, routes: { prefix: '/admin' } },
  { register: libVideo, routes: { prefix: '/view' } },
  { register: libWalk },
  {
    register: hapiSwagger,
    options: { info: { title: 'history API', version: pkg.version } }
  },
  { register: lout }
];

module.exports = plugins;

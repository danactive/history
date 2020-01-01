const hapiSwagger = require('hapi-swagger');
const inert = require('inert');
const lout = require('lout');
const vision = require('vision');

const utils = require('../plugins/utils');

utils.env.load();

const libAdmin = require('../plugins/admin/lib');
const viewAlbum = require('../plugins/album/lib');
const editAlbum = require('../plugins/editAlbum/lib');
const exploreVideo = require('../plugins/exploreVideo/lib');
const libGallery = require('../plugins/gallery/lib');
const generatePreview = require('../plugins/generatePreview/lib');
const libGeojson = require('../plugins/geojson/lib');
const libHome = require('../plugins/home/lib');
const libPublic = require('../plugins/public/lib');
const libRename = require('../plugins/rename/lib');
const libResize = require('../plugins/resize/lib');
const libWalk = require('../plugins/walk/lib');
const libVideo = require('../plugins/video/lib');

const pkg = require('../../package');

const plugins = [
  inert,
  vision,
  { plugin: libAdmin, routes: { prefix: '/admin' } },
  { plugin: viewAlbum, routes: { prefix: '/view' } },
  { plugin: editAlbum, routes: { prefix: '/edit' } },
  { plugin: exploreVideo, routes: { prefix: '/explore' } },
  { plugin: libGallery },
  { plugin: generatePreview },
  { plugin: libGeojson, routes: { prefix: '/geojson' } },
  { plugin: libHome },
  { plugin: libPublic },
  { plugin: libRename, routes: { prefix: '/admin' } },
  { plugin: libResize, routes: { prefix: '/admin' } },
  { plugin: libVideo, routes: { prefix: '/view' } },
  { plugin: libWalk },
  {
    plugin: hapiSwagger,
    options: { info: { title: 'history API', version: pkg.version } },
  },
  { plugin: lout },
];

module.exports = plugins;

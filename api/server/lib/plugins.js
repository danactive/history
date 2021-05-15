const hapiSwagger = require('hapi-swagger');
const inert = require('@hapi/inert');
const vision = require('@hapi/vision');

const utils = require('../plugins/utils');

utils.env.load();

const viewAlbum = require('../plugins/album/lib');
const editAlbum = require('../plugins/editAlbum/lib');
const libGallery = require('../plugins/gallery/lib');
const generatePreview = require('../plugins/generatePreview/lib');
const libGeojson = require('../plugins/geojson/lib');
const libHome = require('../plugins/home/lib');
const libPublic = require('../plugins/public/lib');
const libRename = require('../plugins/rename/lib');
const libResize = require('../plugins/resize/lib');
const libWalk = require('../plugins/walk/lib');
const libVideo = require('../plugins/video/lib');

const pkg = require('../../package.json');

const plugins = [
  inert,
  vision,
  { plugin: viewAlbum, routes: { prefix: '/view' } },
  { plugin: editAlbum, routes: { prefix: '/edit' } },
  { plugin: libGallery },
  { plugin: generatePreview, routes: { prefix: '/preview' } },
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
];

module.exports = plugins;

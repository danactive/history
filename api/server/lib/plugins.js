const inert = require('@hapi/inert');
const vision = require('@hapi/vision');

const utils = require('../plugins/utils');

utils.env.load();

const viewAlbum = require('../plugins/album/lib');
const editAlbum = require('../plugins/editAlbum/lib');
const libGallery = require('../plugins/gallery/lib');
const libGeojson = require('../plugins/geojson/lib');
const libHome = require('../plugins/home/lib');
const libPublic = require('../plugins/public/lib');
const libWalk = require('../plugins/walk/lib');
const libVideo = require('../plugins/video/lib');

const pkg = require('../../package.json');

const plugins = [
  inert,
  vision,
  { plugin: viewAlbum, routes: { prefix: '/view' } },
  { plugin: editAlbum, routes: { prefix: '/edit' } },
  { plugin: libGallery },
  { plugin: libGeojson, routes: { prefix: '/geojson' } },
  { plugin: libHome },
  { plugin: libPublic },
  { plugin: libVideo, routes: { prefix: '/view' } },
  { plugin: libWalk },
];

module.exports = plugins;

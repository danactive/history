const convertor = require('geojson');

const viewAlbum = require('../../album/lib/json');

module.exports.dataToGeojson = (gallery, albumStem) => new Promise((resolve, reject) => {
  viewAlbum.getAlbum(gallery, albumStem)
    .then((albumData) => {
      const jsonData = convertor.parse(albumData.album.items, { Point: ['geo.lat', 'geo.lon'] });
      resolve(jsonData);
    })
    .catch(error => reject(error));
});

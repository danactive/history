/* global $, album, util */
const schema = {
  filename: 'filename',
  city: 'photo_city',
  location: 'photo_loc',
  caption: 'thumb_caption',
  description: 'photo_desc',
  ref_name: 'ref.name',
  ref_src: 'ref.source',
  geo_lat: 'geo.lat',
  geo_lon: 'geo.lon',
};
function SaveToJson(event) {
  function examineThumbs(i, thumb) {
    let $field;
    let fieldValue;
    const jsonPhoto = $(thumb).data('photo') || {}; // live reference
    let xmlNameArray;

    $.each(schema, (elementId, xPath) => {
      $field = $(`#${elementId}`);
      if ($field.prop('disabled')) { // do NOT generate if field disabled
        return true; // continue to next selected thumb
      }

      fieldValue = $field.val();
      fieldValue = fieldValue.replace(/&/g, '&amp;'); // XML safe
      if (fieldValue === '') {
        fieldValue = undefined;
      }

      if (xPath.indexOf('.') === -1) {
        jsonPhoto[xPath] = fieldValue;
      } else { // dot syntax found
        xmlNameArray = xPath.split('.');
        if (!jsonPhoto[xmlNameArray[0]]) { // create object if missing from JSON
          jsonPhoto[xmlNameArray[0]] = {};
        }

        jsonPhoto[xmlNameArray[0]][xmlNameArray[1]] = fieldValue;
        if (fieldValue === undefined) {
          delete jsonPhoto[xmlNameArray[0]][xmlNameArray[1]];
        }

        if (JSON.stringify(jsonPhoto[xmlNameArray[0]]) === JSON.stringify({})) {
          delete jsonPhoto[xmlNameArray[0]];
        }
      }

      return true;
    });
  }
  $('#listPhotos .selected').each(examineThumbs);
  $('#rawAlbumJson').val(JSON.stringify(album.json)); // display in textarea
  $('#rawAlbumJsonToXml').val(util.xml.formatPretty(util.json.convertToXml(album.json, '')));
  event.preventDefault();
  $('input').blur(); // allow arrows to move through thumbnails not fields
}

// If Node.js then export as public
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
  module.exports = SaveToJson;
}

/* global ColorThief, createMap, jQuery, window */
const MAP_BOX_ID = 'mapBox';

const colorThief = new ColorThief();
const $mapBox = jQuery(`#${MAP_BOX_ID}`);

const toggleMapButtonLabel = () => {
  const SHOW_MAP_LABEL = 'Expand Map';
  const HIDE_MAP_LABEL = 'Collapse Map';

  const $button = jQuery(this);
  // const $button = jQuery(this.target); // jQuery 3.x
  const textOnClick = $button.text();

  if (textOnClick === HIDE_MAP_LABEL) {
    $button.text(SHOW_MAP_LABEL);
  } else {
    $button.text(HIDE_MAP_LABEL);
  }
};

function showMarker(map, _lon, _lat) {
  const lat = parseFloat(_lat);
  const lon = parseFloat(_lon);

  if (Number.isNaN(lat) || Number.isNaN(lon)) {
    return;
  }

  map.flyTo({ center: [lon, lat], zoom: 14, screenSpeed: 2, curve: Math.pow(3, 0.25) });
}

function photoViewed() {
  const photoImage = jQuery('img.cboxPhoto').get(0);
  const $thumbImage = jQuery(this);
  const dominateColour = photoImage ? colorThief.getColor(photoImage) : [0, 0, 0];
  const $thumbBox = $thumbImage.parents('.liAlbumPhoto');

  $thumbBox.addClass('imgViewed'); //  change thumb to white

  // lightbox
  jQuery('#cboxOverlay').css('background', `rgb(${dominateColour[0]},${dominateColour[1]},${dominateColour[2]})`);
  jQuery.fn.colorbox.resize();

  if (window.map) {
    showMarker(window.map, $thumbBox.attr('data-lon'), $thumbBox.attr('data-lat'));
  }
}

jQuery('#albumBox a').colorbox({
  preloading: true,
  onComplete: photoViewed,
  transition: 'none'
});

jQuery('#linkMap').click(() => {
  jQuery('body').toggleClass('splitMode');
  $mapBox.toggleClass('hide');
  toggleMapButtonLabel();
  createMap(MAP_BOX_ID);
});

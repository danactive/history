/* global ColorThief, createMap, jQuery, getQueryByName */
const MAP_BOX_ID = 'mapBox';

const colorThief = new ColorThief();
let map;
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

function photoViewed() {
  const photoImage = jQuery('img.cboxPhoto').get(0);
  const $thumbImage = jQuery(this);
  const dominateColour = photoImage ? colorThief.getColor(photoImage) : [0, 0, 0];
  const $thumbBox = $thumbImage.parents('.liAlbumPhoto');

  $thumbBox.addClass('imgViewed'); //  change thumb to white

  // lightbox
  jQuery('#cboxOverlay').css('background', `rgb(${dominateColour[0]},${dominateColour[1]},${dominateColour[2]})`);
  jQuery.fn.colorbox.resize();

  if (map) {
    const index = parseInt($thumbBox.attr('id').replace('photo', ''), 10);
    map.pin.go(index);
  }
}

jQuery('#albumBox a').colorbox({
  preloading: true,
  onComplete: photoViewed,
  transition: 'none',
});

jQuery('#linkMap').click(() => {
  jQuery('body').toggleClass('splitMode');
  $mapBox.toggleClass('hide');
  toggleMapButtonLabel();
  createMap(MAP_BOX_ID);
});

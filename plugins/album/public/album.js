/* global ColorThief, createMap, jQuery, getQueryByName */
const colorThief = new ColorThief();
let map;
const mapBoxId = 'mapBox';
const $mapBox = jQuery(`#${mapBoxId}`);

function photoViewed() {
  const photoImage = jQuery('img.cboxPhoto').get(0);
  const $thumbImage = jQuery(this);
  const dominateColour = photoImage ? colorThief.getColor(photoImage) : [0, 0, 0];
  const $thumbBox = $thumbImage.parents('.liAlbumPhoto');

  $thumbBox.addClass('imgViewed'); //  change thumb to white

  // lightbox
  jQuery('#cboxOverlay').css('background-color', `rgb(${dominateColour[0]},${dominateColour[1]},${dominateColour[2]})`);
  jQuery('#cboxTitle').hide();
  jQuery('#cboxLoadedContent').append(jQuery('#cboxTitle').html()).css({ color: jQuery('#cboxTitle').css('color') });
  jQuery.fn.colorbox.resize();
  if (map) {
    const index = parseInt($thumbBox.attr('id').replace('photo', ''), 10);
    map.pin.go(index);
  }
}
jQuery('#albumBox a').colorbox({
  right: '25%',
  preloading: true,
  onComplete: photoViewed,
  title: function title() {
    if (this && this.dataset && this.dataset.caption) {
      return this.dataset.caption;
    }
    return jQuery(this).data('caption');
  },
  transition: 'none',
});

jQuery('#linkMap').click(function toggleMap() {
  const SHOW_MAP_LABEL = 'Expand Map';
  const HIDE_MAP_LABEL = 'Collapse Map';
  const toggleMapButtonLabel = () => {
    const $button = jQuery(this);
    // const $button = jQuery(this.target); // jQuery 3.x
    const textOnClick = $button.text();

    if (textOnClick === HIDE_MAP_LABEL) {
      $button.text(SHOW_MAP_LABEL);
    } else {
      $button.text(HIDE_MAP_LABEL);
    }
  };
  jQuery.ajax({
    url: '/view/album',
    data: {
      album_stem: getQueryByName('album_stem'),
      gallery: getQueryByName('gallery'),
      raw: true,
    },
    success: createMap,
  });
  jQuery('body').toggleClass('splitMode');
  $mapBox.toggleClass('hide');
  toggleMapButtonLabel();
});

function instagram() {
  jQuery.ajax({
    url: '/api/instagram',
    success: (response) => {
      const html = [];
      response.forEach((photo) => {
        html.push(`<img src="${photo.images.thumbnail.url}" width="${photo.images.thumbnail.width}" height="${photo.images.thumbnail.height}">`);
      });
      jQuery('body').append(html.join(''));
    },
  });
}

// If Node.js then export as public
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
  module.exports = {
    instagram,
  };
}


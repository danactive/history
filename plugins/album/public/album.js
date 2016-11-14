/* global ColorThief, jQuery, getQueryByName */
const colorThief = new ColorThief();
let map;
const mapBoxId = 'mapBox';
const $mapBox = jQuery(`#${mapBoxId}`);

function photoViewed() {
  const photoImage = jQuery('img.cboxPhoto').get(0);
  const $thumbImage = jQuery(this);
  const dominateColour = colorThief.getColor(photoImage);
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

function displayAlbum(response) {
  // map = new Map({
  //   album: meta.album,
  //   gallery: meta.gallery,
  //   events: {
  //     highlightPlottedPin: () => {
  //       $mapBox.removeClass('subtle');
  //     },
  //     highlightOmittedPin: () => {
  //       $mapBox.addClass('subtle');
  //     }
  //   },
  //   map: {
  //     centre: [0, 0],
  //     containerId: mapBoxId,
  //     itemCount: response.json.album.item.length
  //   }
  // });
  //
  // if (response.json.album.item) {
  //   jQuery.each(response.json.album.item, function(i, item) {
  //     var addOptions = {},
  //       filename = item.filename || '';
  //
  //     if (typeof filename === 'object') {
  //       filename = item.filename[0];
  //     }
  //     addOptions.html = `<div class="thumbPlaceholder"><img src="${map.util.filenamePath(filename, true)}.jpg"></div>
  // <div class="caption">${item.thumb_caption}</div>`;
  //     addOptions.id = filename || i;
  //     addOptions.index = parseInt(item.sort, 10);
  //
  //     if (item.geo) {
  //       addOptions.coordinates = [item.geo.lon, item.geo.lat];
  //     }
  //
  //     map.pin.add(addOptions);
  //   }); //close each
  // }
  console.log(response);
} // close displayAlbum

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
    success: displayAlbum,
  });
  jQuery('body').toggleClass('splitMode');
  $mapBox.toggleClass('hide');
  toggleMapButtonLabel();
});

/* global ColorThief, jQuery */
const colorThief = new ColorThief();
let map;
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

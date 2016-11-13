const colorThief = new ColorThief();
let map;
function photoViewed() {
  /*jshint validthis:true */
  'use strict';
  var dominateColour,
    index,
    photoImage = jQuery("img.cboxPhoto").get(0),
    $thumbBox,
    $thumbImage = jQuery(this);
  dominateColour = colorThief.getColor(photoImage);
  $thumbBox = $thumbImage.parents('.liAlbumPhoto');

  $thumbBox.addClass('imgViewed'); //  change thumb to white

  // lightbox
  jQuery("#cboxOverlay").css("background-color", "rgb(" + dominateColour[0] + "," + dominateColour[1] + "," + dominateColour[2] + ")"); // change background colour
  jQuery("#cboxTitle").hide();
  jQuery("#cboxLoadedContent").append(jQuery("#cboxTitle").html()).css({color: jQuery("#cboxTitle").css("color")});
  jQuery.fn.colorbox.resize();
  if (map) {
    index = parseInt($thumbBox.attr("id").replace("photo", ""), 10);
    map.pin.go(index);
  }
}
jQuery('#albumBox a').colorbox({
  "right": '25%',
  "preloading": true,
  "onComplete": photoViewed,
  "title": function () {
    if (this && this.dataset && this.dataset.caption) {
      return this.dataset.caption;
    } else {
      return jQuery(this).data('caption');
    }
  },
  "transition": 'none'
});

/* global jQuery */

function getLocation() {
  const photo = jQuery(this);
  const location = {
    lat: photo.data('lon'),
    lon: photo.data('lon'),
  };
  return location;
}

function instagram() {
  jQuery('.liAlbumPhoto').on('click', (e) => {
    console.log(e);

    function createHyperlink() {
      jQuery('#separator').remove();
      jQuery('#showFlickrBtn').remove();

      jQuery('#cboxTitle').append('<span id="separator"> | </span><a href="#gallery" id="showFlickrBtn">Check Nearby Photos</a>');
    }

    // Show gallery
    jQuery('#showFlickrBtn').click(() => {
      jQuery.ajax({
        url: '/view/instagram',
        success: (response) => {
          const html = [];
          response.forEach((image) => {
            html.push(`<img src=${image}/></a>`);
          });

          jQuery('#gallery').append(html.join(''));
          jQuery('#gallery').justifiedGallery();
        },
      });
    });

    setTimeout(createHyperlink, 100);
  });
}


// If Node.js then export as public
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
  module.exports = {
    instagram,
    getLocation,
  };
}



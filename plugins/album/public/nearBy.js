/* global jQuery */

jQuery('.liAlbumPhoto').on('click', function (e) {
  console.log(e);
  // Register HTML Elements
  const photo = jQuery(this);
  const photoArea = jQuery('#mygallery');

  function dispPhoto(data) {
    const photos = data.getElementsByTagName('photo');
    photoArea.html('');

    for (let i = 0; i < 50; i += 1) {
      const farmId = photos[i].getAttribute('farm');
      const serverId = photos[i].getAttribute('server');
      const id = photos[i].getAttribute('id');
      const secret = photos[i].getAttribute('secret');

      const url = `http://farm${farmId}.staticflickr.com/${serverId}/${id}_${secret}_s.jpg`;
      photoArea.append(`<a href='${url}'><img src='${url}'/></a>`);
      jQuery('#mygallery').justifiedGallery();
    }
  }

  function requestSearch(uri) {
    jQuery.ajax({
      url: uri,
      success: (response) => {
        dispPhoto(response);
      },
    });
  }

  function generateFlickr() {
    // RESET
    jQuery('#separator').remove();
    jQuery('#showFlickrBtn').remove();

    jQuery('#cboxTitle').append('<span id="separator"> | </span><a href="#mygallery" id="showFlickrBtn">Check Nearby Photos</a>');

    // Make URL Here
    const server = 'https://api.flickr.com/services/rest';
    const method = '?method=flickr.photos.search';
    const apiKey = '&api_key=671aab1520e2cb69e08dd36a5f40213b';
    const lat = photo.data('lat');
    const lon = photo.data('lon');

    const searchURI = `${server}${method}${apiKey}&has_geo=1&lat=${lat}&lon=${lon}&radius=1&radius_units=km&extras=geo`;

    // Start Checking Flickr
    jQuery('#showFlickrBtn').click(() => {
      requestSearch(searchURI);
    });
  }

  if (photo.data('lat') !== '' && photo.data('lon') !== '') {
    setTimeout(generateFlickr, 100);
  }

  jQuery('#cboxPrevious, #cboxNext').on('click', () => {
    // Register HTML Elements
    photoArea.html('');
  });

  jQuery('body').on('click', 'img.cboxPhoto', () => {
    // Register HTML Elements
    photoArea.html('');
  });
});

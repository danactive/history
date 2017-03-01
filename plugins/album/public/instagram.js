/* global jQuery */

// const redirUrl = 'http://localhost:8000';
// const authUrl = `https://api.instagram.com/oauth/authorize/?client_id=${clientId}&redirect_uri=${redirUrl}&response_type=code`;
jQuery('.liAlbumPhoto').on('click', () => {
  // window.location = (authUrl);
  const accessToken = '1449178229.53cbd33.5fe02c44297a45b7b71cd74093aa51f9';
  const endpoint = 'https://api.instagram.com/v1';
  const lat = jQuery(this).data('lat');
  const lng = jQuery(this).data('lon');
  console.log(lat);
  console.log(lng);
  jQuery.ajax({
    type: 'GET',
    dataType: 'jsonp',
    cache: false,
    url: `${endpoint}/media/search?lat=${lat}&lng=${lng}&access_token=${accessToken}`,
    success: (response) => {
      console.log(response);
      const obj = response.data;
      obj.forEach((item) => {
        const thumbnail = item.images.thumbnai.url;
        const stanRes = item.images.standard_resolution.url;
        jQuery('#justifiedGallery').append(`<a href=${stanRes}><img src=${thumbnail}/></a>`);
      });
    },
  });
});

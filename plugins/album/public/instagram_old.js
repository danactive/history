/* global jQuery */

const accessToken = '1449178229.53cbd33.5fe02c44297a45b7b71cd74093aa51f9';

// const redirUrl = 'http://localhost:8000';
// const authUrl = `https://api.instagram.com/oauth/authorize/?client_id=${clientId}&redirect_uri=${redirUrl}&response_type=code`;
// albumBox (image) onClick
jQuery('.liAlbumPhoto').on('click', function(e) {
  console.log('albumBox');
  // window.location = (authUrl);
  const lat = jQuery(this).data('lat');
  const lng = jQuery(this).data('lon');
  const locationUrl = 'https://api.instagram.com/v1/locations/search?lat=48.858844&lng=2.294351&access_token=1449178229.53cbd33.5fe02c44297a45b7b71cd74093aa51f9';
  jQuery.ajax({
    type: 'GET',
    dataType: 'jsonp',
    cache: false,
    url: `https://api.instagram.com/v1/locations/search?lat=${lat}&lng=${lng}&access_token=${accessToken}`,
    success: (data) => {
      const obj = data.data;
      obj.forEach( (element) => {
        console.log(element.id);
        const id = element.id;
        jQuery.ajax({
          type: 'GET',
          dataType: 'jsonp',
          cache: false,
          url: `https://api.instagram.com/v1/locations/${id}/media/recent?access_token=${accessToken}`,
          success: (data) => {
            console.log(data);
          }
        })
      })
    },
  });
});

/* global window, jQuery */
console.log('hello world');

// const clientId = '53cbd338e38643ba96179cdb50a333a3';
// const clientSecret = '8225835440eb4689b1632b808d5ccea7';
const accessToken = 'd62cc33006384dbe9a9f7a3cbb39a46d';

// const redirUrl = 'http://localhost:8000';
// const authUrl = `https://api.instagram.com/oauth/authorize/?client_id=${clientId}&redirect_uri=${redirUrl}&response_type=code`;
// albumBox (image) onClick
jQuery('#albumBox').click(() => {
  console.log('albumBox');
  // window.location = (authUrl);
  const locationUrl = `https://api.instagram.com/v1/locations/search?lat=48.858844&lng=2.294351&access_token=${accessToken}`;
  jQuery.ajax({
    type: 'GET',
    url: locationUrl,
    dataType: 'jsonp',
    success: (response) => {
      console.log(response);
    },
  });
});

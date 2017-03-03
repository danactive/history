/* global module */

const credentials = {
  flickr: {
    api_key: '671aab1520e2cb69e08dd36a5f40213b',
    secret: '99a4607019e61826',
  },
  instagram: {
    client_id: '53cbd338e38643ba96179cdb50a333a3',
<<<<<<< HEAD
    client_secret: '8225835440eb4689b1632b808d5ccea7',
=======
    client_secret: '8225835440eb4689b1632b808d5ccea7'
>>>>>>> 721c347... credentials update
  },
};

const isNode = (typeof module !== 'undefined' && typeof module.exports !== 'undefined');

if (isNode) {
  module.exports.flickr = {
    api_key: credentials.flickr.api_key,
  };
  module.exports.instagram = {
    client_id: credentials.instagram.client_id,
    client_secret: credentials.instagram.client_secret,
    access_Token: credentials.instagram.access_token,
  };
}

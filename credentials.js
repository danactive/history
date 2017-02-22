/* global module */

const credentials = {
  flickr: {
    api_key: '671aab1520e2cb69e08dd36a5f40213b',
    secret: '99a4607019e61826',
  },
  instagram: {
    client_id: '53cbd338e38643ba96179cdb50a333a3',
    client_secret: '8225835440eb4689b1632b808d5ccea7'
  },
};

const isNode = (typeof module !== 'undefined' && typeof module.exports !== 'undefined');

if (isNode) {
  module.exports.flickr = {
    api_key: credentials.flickr.api_key,
  };
}

const credentials = {
  flickr: {
    api_key: '671aab1520e2cb69e08dd36a5f40213b',
  },
};

const isNode = (typeof module !== 'undefined' && typeof module.exports !== 'undefined');

if (isNode) {
  module.exports = {
    flickr: credentials.flickr,
  };
}

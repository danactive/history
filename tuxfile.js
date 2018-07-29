const credentials = require('./server/credentials.js');

const harnesses = [];

harnesses.push({
  route: 'flickr?lat=49.25&lon=-123.1',
  data: credentials,
  view: 'flickr_gallery.dust',
});

harnesses.push({
  route: 'walk-path',
  data: 'http://localhost:8000/template/walk-path',
  view: 'harness/directory_contents.dust',
});

module.exports = {
  register: {
    port: 8001,
    static: {
      route: '/',
      directory: '/public',
    },
    view: {
      engines: ['dust'],
      path: 'src/views',
    },
  },
  harnesses,
};

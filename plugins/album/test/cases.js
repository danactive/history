const testCases = [];

const normalize = {
  statusCode: error => error.statusCode || error.output.statusCode,
};

testCases.push({
  name: '* Catch fake gallery',
  options: { skip: false },
  request: {
    gallery: 'FAKE',
    album_stem: 'sample',
  },
  success: assert => assert.fail('Unexpected response found'),
  error: (assert, error) => {
    assert.ok(error, 'Caught expected error');
    assert.equal(normalize.statusCode(error), 404, 'Status code');
    assert.end();
  },
});

testCases.push({
  name: '* Catch fake album',
  options: { skip: false },
  request: {
    gallery: 'demo',
    album_stem: 'FAKE',
  },
  success: assert => assert.fail('Unexpected response found'),
  error: (assert, error) => {
    assert.ok(error, 'Caught expected error');
    assert.equal(normalize.statusCode(error), 404, 'Status code');
    assert.end();
  },
});

testCases.push({
  name: '* Catch invalid format',
  options: { skip: false },
  request: {
    gallery: 'demo',
    album_stem: 'invalid',
  },
  success: assert => assert.fail('Unexpected response found'),
  error: (assert, error) => {
    assert.ok(error, 'Caught expected error');
    assert.equal(normalize.statusCode(error), 403, 'Status code');
    assert.end();
  },
});

testCases.push({
  name: '* Read valid document',
  options: { skip: false },
  request: {
    gallery: 'demo',
    album_stem: 'sample',
  },
  successJson: (assert, response) => {
    assert.ok(response, 'Has response');
    assert.equal(response.album.meta.albumName, 'sample', 'Album name');
    assert.end();
  },
  successView: (assert, response) => {
    assert.ok(response, 'Has response');
    assert.ok(response.indexOf('2012-fireplace.mp4') > 0, 'HTML string');
    assert.end();
  },
  error: (assert, error) => assert.fail(`Unexpected response found ${JSON.stringify(error)}`),
});

module.exports = testCases;

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
  then: assert => assert.fail('Unexpected response found'),
  catch: (assert, error) => {
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
  then: assert => assert.fail('Unexpected response found'),
  catch: (assert, error) => {
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
  then: assert => assert.fail('Unexpected response found'),
  catch: (assert, error) => {
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
  then: (assert, response) => {
    assert.ok(response, 'Has response');
    assert.equal(response.album.meta[0].album_name[0], 'sample', 'Album name');
    assert.end();
  },
  catch: assert => assert.fail('Unexpected response found'),
});

module.exports = testCases;

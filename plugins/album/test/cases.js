const cases = [];

const normalize = {
  statusCode: error => error.statusCode || error.output.statusCode
};

cases.push({
  name: '* Catch missing gallery',
  options: { skip: false },
  request: {},
  success: assert => assert.fail('Unexpected response found'),
  error: (assert, error, options = {}) => {
    assert.ok(error, 'Caught expected error');

    if (options.rest === true) {
      assert.ok(normalize.statusCode(error), 400, 'Status code');
    } else {
      assert.ok(normalize.statusCode(error), 406, 'Status code');
    }

    assert.end();
  }
});

cases.push({
  name: '* Catch missing album',
  options: { skip: false },
  request: {
    gallery: 'FAKE'
  },
  success: assert => assert.fail('Unexpected response found'),
  error: (assert, error, options = {}) => {
    assert.ok(error, 'Caught expected error');

    if (options.rest === true) {
      assert.ok(normalize.statusCode(error), 400, 'Status code');
    } else {
      assert.ok(normalize.statusCode(error), 406, 'Status code');
    }

    assert.end();
  }
});

cases.push({
  name: '* Catch fake gallery',
  options: { skip: false },
  request: {
    gallery: 'FAKE',
    album_stem: 'sample'
  },
  success: assert => assert.fail('Unexpected response found'),
  error: (assert, error) => {
    assert.ok(error, 'Caught expected error');
    assert.equal(normalize.statusCode(error), 404, 'Status code');
    assert.end();
  }
});

cases.push({
  name: '* Catch fake album',
  options: { skip: false },
  request: {
    gallery: 'demo',
    album_stem: 'FAKE'
  },
  success: assert => assert.fail('Unexpected response found'),
  error: (assert, error) => {
    assert.ok(error, 'Caught expected error');
    assert.equal(normalize.statusCode(error), 404, 'Status code');
    assert.end();
  }
});

cases.push({
  name: '* Catch invalid format',
  options: { skip: false },
  request: {
    gallery: 'demo',
    album_stem: 'invalid'
  },
  success: assert => assert.fail('Unexpected response found'),
  error: (assert, error) => {
    assert.ok(error, 'Caught expected error');
    assert.equal(normalize.statusCode(error), 403, 'Status code');
    assert.end();
  }
});

cases.push({
  name: '* Read valid document',
  options: { skip: false },
  request: {
    gallery: 'demo',
    album_stem: 'sample',
    raw: true
  },
  successJson: (assert, response) => {
    assert.ok(response, 'Has response');
    assert.equal(response.album.meta.albumName, 'sample', 'Album name');
    assert.end();
  },
  successView: (assert, result) => {
    assert.ok(result, 'Has response');
    const actual = result.album.items.length;
    const expected = 5;
    assert.equal(actual, expected, 'Photo count');
    assert.end();
  },
  error: (assert, error) => assert.fail(`Unexpected response found ${JSON.stringify(error)}`) && assert.end()
});

module.exports = { cases };

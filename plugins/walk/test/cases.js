const cases = [];

cases.push({
  name: '* Find galleries folder',
  options: { skip: false },
  request: { raw: true },
  success: (assert, response) => {
    let assertionEnded = false;
    response.files.forEach((file) => {
      if (file.name === 'galleries') {
        assertionEnded = true;
        assert.pass('Galleries found');
      }
    });

    if (assertionEnded) {
      assert.end();
      return;
    }

    assert.fail('Demo gallery not found');
    assert.end();
  },
  error: (assert, error) => {
    assert.ok(error, 'Caught expected error');
    assert.end();
  }
});

cases.push({
  name: '* Public test path',
  options: { skip: false },
  request: { path: 'test/fixtures/walkable', raw: true },
  success: (assert, response) => {
    let assertionEnded = false;
    let matchCount = 0;
    response.files.forEach((file) => {
      if (file.name === 'jay' || file.name === 'tee') {
        assertionEnded = true;
        matchCount += 1;
        assert.pass(`Found an expected file (${file.name})`);
      }
    });

    if (assertionEnded && matchCount === 2) {
      assert.pass('All fixtures found');
      assert.end();
      return;
    }

    assert.fail('All fixtures not found');
    assert.end();
  },
  error: (assert, error) => {
    assert.ok(error, 'Caught expected error');
    assert.end();
  }
});

module.exports = { cases };

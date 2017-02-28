const tape = require('tape-catch');

tape('GeoJSON JSON', { skip: false }, (describe) => {
  const geojsonhint = require('@mapbox/geojsonhint');
  const lib = require('../lib/json');

  describe.test('* Validate GeoJSON', (assert) => {
    const expectedError = geojsonhint.hint({});

    assert.ok(expectedError.length > 0, 'Error expected');

    lib.dataToGeojson('demo', 'sample')
      .then((json) => {
        const error = geojsonhint.hint(json);

        assert.equal(error.length, 0, 'Validation passes');
        assert.end();
      });
  });
});

const tape = require('tape-catch');

tape('Read album XML', { skip: false }, (describe) => {
  const lib = require('../lib/json');
  const testCases = require('./cases');

  testCases.forEach((testCase) => {
    describe.test(testCase.name, testCase.options, (assert) => {
      lib.getAlbum(testCase.request.gallery, testCase.request.album_stem)
      .then((response) => {
        if (testCase.success) {
          testCase.success(assert, response);
        } else {
          testCase.successJson(assert, response);
        }
      })
      .catch(error => testCase.error(assert, error));
    });
  });

  describe.test('* Caption', { skip: false }, (assert) => {
    const item = { description: 'Description' };
    assert.equal(lib.caption(item), item.description, 'Description');

    item.city = 'City';
    assert.equal(lib.caption(item), `${item.city}: ${item.description}`, 'City & Description');

    item.location = 'Location';
    assert.equal(lib.caption(item), `${item.location} (${item.city}): ${item.description}`, 'Loc, City, Desc');

    delete item.description;
    assert.equal(lib.caption(item), `${item.location} (${item.city})`, 'Location & City');

    delete item.city;
    assert.equal(lib.caption(item), item.location, 'Location');

    item.description = 'Desc2';
    assert.equal(lib.caption(item), `${item.location}: ${item.description}`, 'Location & Description');

    delete item.description;
    delete item.location;
    item.city = 'City2';
    assert.equal(lib.caption(item), item.city, 'City');
    assert.end();
  });

  describe.test('* Prepare JSON for view template', { skip: false }, (assert) => {
    let json = lib.templatePrepare();
    assert.deepEqual(json, {}, 'Blank');

    const meta = { meta: 'Self talk' };
    json = lib.templatePrepare(meta);
    assert.deepEqual(json, meta, 'Meta');

    const items = [{ $: { id: 1 } }];
    json = lib.templatePrepare({ items });
    assert.deepEqual(json, { items }, 'Items');

    json = lib.templatePrepare({ items, meta });
    assert.deepEqual(json, { items, meta }, 'Meta & Items');

    items[0].city = 'City';
    items[0].description = 'Description';
    json = lib.templatePrepare({ items, meta });
    assert.equal(json.items[0].caption, `${items[0].city}: ${items[0].description}`, 'Caption');
    assert.end();
  });
});

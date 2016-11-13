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
    const item = { thumbCaption: 'Caption' };
    assert.equal(lib.caption(item), item.thumbCaption, 'Caption');
    assert.end();
  });

  describe.test('* Path', { skip: false }, (assert) => {
    const item = { filename: '2016-12-31-01.jpg' };
    const expectedPath = `/static/gallery-demo/media/thumbs/2016/${item.filename}`;
    assert.equal(lib.thumbPath(item, 'demo'), expectedPath, 'Path');
    assert.end();
  });

  describe.test('* Title', { skip: false }, (assert) => {
    const item = { photoDesc: 'Description' };
    assert.equal(lib.title(item), item.photoDesc, 'Description');

    item.photoCity = 'City';
    assert.equal(lib.title(item), `${item.photoCity}: ${item.photoDesc}`, 'City & Description');

    item.photoLoc = 'Location';
    assert.equal(lib.title(item), `${item.photoLoc} (${item.photoCity}): ${item.photoDesc}`, 'Loc, City, Desc');

    delete item.photoDesc;
    assert.equal(lib.title(item), `${item.photoLoc} (${item.photoCity})`, 'Location & City');

    delete item.photoCity;
    assert.equal(lib.title(item), item.photoLoc, 'Location');

    item.photoDesc = 'Desc2';
    assert.equal(lib.title(item), `${item.photoLoc}: ${item.photoDesc}`, 'Location & Description');

    delete item.photoDesc;
    delete item.photoLoc;
    item.photoCity = 'City2';
    assert.equal(lib.title(item), item.photoCity, 'City');
    assert.end();
  });

  describe.test('* Prepare JSON for view template without enhancements', { skip: false }, (assert) => {
    let result = lib.templatePrepare();
    assert.deepEqual(result, {}, 'Blank');

    const mock = { album: { meta: 'Self talk' } };
    result = lib.templatePrepare(mock);
    assert.deepEqual(result, mock, 'Meta');

    mock.album.item = [{ $: { id: 1 } }];
    result = lib.templatePrepare(mock);
    assert.deepEqual(result.album.meta, mock.album.meta, 'Meta (w/ Items)');
    assert.deepEqual(result.album.items[0].$, mock.album.item[0].$, 'Items (w/ Meta)');

    assert.end();
  });

  describe.test('* Prepare JSON for view template with enhancements', { skip: false }, (assert) => {
    const mock = {
      album: {
        meta: { gallery: 'demo' },
        item: [{
          $: { id: 1 },
          filename: '2016-Filename.jpg',
          photoDesc: 'Desc',
          photoCity: 'City',
          thumbCaption: 'Caption',
        }],
      },
    };
    const result = lib.templatePrepare(mock);
    assert.notDeepEqual(result, mock, 'Clone result, not pass by reference');
    assert.deepEqual(result.album.meta, mock.album.meta, 'Meta (w/ Items)');
    assert.deepEqual(result.album.items[0].$, mock.album.item[0].$, 'Items (w/ Meta)');
    assert.equal(result.album.items[0].caption, 'Caption', 'Caption');
    assert.equal(result.album.items[0].title, 'City: Desc', 'Title');
    assert.equal(result.album.items[0].path, '/static/gallery-demo/media/thumbs/2016/2016-Filename.jpg', 'Path');

    assert.end();
  });
});

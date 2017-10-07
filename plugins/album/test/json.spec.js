const test = require('tape-catch');

test('Read album XML', { skip: false }, (describe) => {
  const lib = require('../lib/json');
  const testCases = require('./cases');

  describe.test('* Check for safe paths', { skip: false }, (assert) => {
    const names = ['gallery', 'albumStem'];

    names.forEach((name) => {
      let result = lib.safePath(name, undefined);
      assert.ok(result.isBoom, `Undefined fails ${name}`);

      result = lib.safePath(name, '');
      assert.ok(result.isBoom, `Blank fails ${name}`);

      result = lib.safePath(name, '@');
      assert.ok(result.isBoom, `Special char fails ${name}`);

      result = lib.safePath(name, 'pass');
      assert.equal(typeof result, 'string', `Pass ${name}`);

      result = lib.safePath(name, '_PASS--123_');
      assert.equal(typeof result, 'string', `Pass (x2) ${name}`);
    });

    assert.end();
  });

  testCases.cases.forEach((testCase) => {
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

    item.type = 'video';
    assert.equal(lib.caption(item), `Video: ${item.thumbCaption}`, 'Caption w/ Video');
    assert.end();
  });

  describe.test('* Path', { skip: false }, (assert) => {
    const item = { filename: '2016-12-31-01.jpg' };
    const expectedPath = `/static/gallery-demo/media/thumbs/2016/${item.filename}`;
    assert.equal(lib.getThumbPath(item, 'demo'), expectedPath, 'Path');
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
          filename: '2016-Image-Filename.jpg',
          photoDesc: 'Desc',
          photoCity: 'City',
          thumbCaption: 'Caption'
        },
        {
          $: { id: 2 },
          type: 'video',
          filename: ['2016-Video-Filename.mov', '2016-Video-Filename.avi'],
          size: { w: 1280, h: 720 },
          photoDesc: 'Desc',
          photoCity: 'City',
          thumbCaption: 'Caption'
        }]
      }
    };
    const result = lib.templatePrepare(mock);
    assert.notDeepEqual(result, mock, 'Clone result, not pass by reference');
    assert.deepEqual(result.album.meta, mock.album.meta, 'Meta (w/ Items)');
    assert.deepEqual(result.album.items[0].$, mock.album.item[0].$, 'Items (w/ Meta)');
    assert.equal(result.album.items[0].caption, 'Caption', 'Image Caption');
    assert.equal(result.album.items[0].thumbCaption, 'Caption', 'Image Thumb Caption');
    assert.equal(result.album.items[0].title, 'City: Desc', 'Title');
    assert.equal(
      result.album.items[0].thumbPath,
      '/static/gallery-demo/media/thumbs/2016/2016-Image-Filename.jpg', 'Thumb Path'
    );
    assert.equal(
      result.album.items[0].mediaPath,
      '/static/gallery-demo/media/photos/2016/2016-Image-Filename.jpg', 'Photo Path'
    );
    assert.equal(result.album.items[1].caption, 'Caption', 'Video Caption');
    assert.equal(result.album.items[1].thumbCaption, 'Video: Caption', 'Video Thumb Caption');
    assert.equal(
      result.album.items[1].mediaPath,
      '/view/video?sources=2016-Video-Filename.mov,2016-Video-Filename.avi&w=1280&h=720&gallery=demo', 'Video Path'
    );

    assert.end();
  });
});

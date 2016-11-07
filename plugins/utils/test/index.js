const tape = require('tape-catch');

tape('Utilities', { skip: false }, (describe) => {
  const lib = require('../lib');
  const path = require('path');

  describe.test('* Config - Get', (assert) => {
    const value = lib.config.get('supportedFileTypes.photo');
    assert.ok(value, 'Retrieve value');
    assert.ok(value.length, 'Get array type');
    assert.ok(value[0], 'jpg', 'Read array index 0');
    assert.ok(value[1], 'jpeg', 'Read array index 1');
    assert.end();
  });

  describe.test('* File - Get File Type', (assert) => {
    assert.equal(lib.file.type(), false, 'No argument');
    assert.equal(lib.file.type('file.type'), 'type', 'Normal type');
    assert.equal(lib.file.type('.gitignore'), 'gitignore', 'Dot file');
    assert.equal(lib.file.type('test.eslintrc'), 'eslintrc', 'Long type');
    assert.equal(lib.file.type('jquery.min.js'), 'js', 'Double type');
    assert.equal(lib.file.type('image.JPG'), 'jpg', 'Uppercase type');
    assert.equal(lib.file.type('image.JPeG'), 'jpeg', 'Mixed case type');
    assert.equal(lib.file.type('word.'), '', 'No type (w/ dot)');
    assert.equal(lib.file.type('word'), '', 'No type');
    assert.equal(lib.file.type('folder/file.type'), 'type', 'Normal type with relative path (forward slash)');
    assert.equal(lib.file.type('folder\file.type'), 'type', 'Normal type with relative path (back slash)');
    assert.end();
  });

  describe.test('* File - Get Mime Type', (assert) => {
    assert.equal(lib.file.mimeType(), false, 'No argument');
    assert.equal(lib.file.mimeType('test.eslintrc'), false, 'Unsupported type');
    assert.equal(lib.file.mimeType('jquery.min.js'), 'application/javascript', 'JavaScript');
    assert.equal(lib.file.mimeType('image.JPG'), 'image/jpeg', 'Uppercase JPEG');
    assert.equal(lib.file.mimeType('image.JPeG'), 'image/jpeg', 'Mixed case JPEG');
    assert.equal(lib.file.mimeType('word'), false, 'No type');
    assert.equal(lib.file.mimeType('folder/file.mp4'), 'video/mp4', 'Video type with relative path (forward slash)');
    assert.equal(lib.file.mimeType('folder\file.webm'), 'video/webm', 'Video type with relative path (back slash)');
    assert.end();
  });

  describe.test('* File - Extension to Mime type', (assert) => {
    ['raw', 'arw'].forEach((type) => {
      const mime = lib.file.mimeType(type);
      assert.equal(mime, 'image/raw', `Image (${type})`);
    });

    ['m2ts', 'mts'].forEach((type) => {
      const mime = lib.file.mimeType(type);
      assert.equal(mime, 'video/mp2t', `Video (${type})`);
    });

    assert.end();
  });

  describe.test('* File - Get Medium Type', (assert) => {
    assert.equal(lib.file.mediumType(), false, 'No argument');
    assert.equal(lib.file.mediumType(''), false, 'Blank type');
    assert.equal(lib.file.mediumType('FAKE'), false, 'Fake type');
    assert.equal(lib.file.mediumType('image/jpeg'), 'image', 'JPEG is image');
    assert.equal(lib.file.mediumType('video/mp4'), 'video', 'MP4 is video');
    assert.equal(lib.file.mediumType('video/webm'), 'video', 'WebM is video');
    assert.end();
  });

  describe.test('* File - Extension to Medium type', (assert) => {
    lib.config.get('rawFileTypes.photo').forEach((type) => {
      const medium = lib.file.mediumType(lib.file.mimeType(type));
      assert.equal(medium, 'image', `Image (${type})`);
    });

    lib.config.get('rawFileTypes.video').forEach((type) => {
      const medium = lib.file.mediumType(lib.file.mimeType(type));
      assert.equal(medium, 'video', `Video (${type})`);
    });

    assert.end();
  });

  describe.test('* File - Ensure absolute path', (assert) => {
    const test = lib.file.absolutePath;
    assert.equal(test('./plugins/utils/test'), __dirname,
      'Relative resolved to Absolute folder');
    assert.equal(test('./plugins/utils/test/fixtures/aitch.html'), path.join(__dirname, './fixtures/aitch.html'),
      'Relative resolved to Absolute file');
    assert.equal(test('./plugins/utils/test/'), path.join(__dirname, '/'),
      'Relative resolved to Absolute folder trailing slash');
    if (lib.platform === 'windows') {
      assert.equal(test('./plugins/utils/test/'), path.join(__dirname, '\\'),
        'Relative resolved to Absolute folder trailing backslash');
    }
    assert.equal(test(__dirname), __dirname,
      'Absolute resolved to folder');
    assert.equal(test(path.join(__dirname, './fixtures/aitch.html')), path.join(__dirname, './fixtures/aitch.html'),
      'Absolute to file');
    assert.end();
  });

  describe.test('* File - Glob', (assert) => {
    assert.plan(8);

    lib.file.glob('./plugins/utils/test/fixtures', '*.fake')
      .then(files => assert.equal(files.length, [].length, 'Find nothing (*.fake)'))
      .catch(error => assert.fail(error));

    lib.file.glob('./plugins/utils/test/fixtures', '*.htm')
      .then(files => assert.equal(path.resolve(files[0]), path.join(__dirname, './fixtures/aitch.htm'), 'Find HTM (*.htm)'))
      .catch(error => assert.fail(error));

    lib.file.glob('./plugins/utils/test/fixtures', '*.html')
      .then(files => assert.equal(path.resolve(files[0]), path.join(__dirname, './fixtures/aitch.html'), 'Find HTML (*.html)'))
      .catch(error => assert.fail(error));

    lib.file.glob('./plugins/utils/test/fixtures', '*.htm*')
      .then((files) => {
        assert.equal(path.resolve(files[0]), path.join(__dirname, './fixtures/aitch.htm'), 'Find HTM (*.htm*)');
        assert.equal(path.resolve(files[1]), path.join(__dirname, './fixtures/aitch.html'), 'Find HTML (*.htm*)');
      })
      .catch(error => assert.fail(error));

    lib.file.glob('./plugins/utils/test/fixtures', '*.*')
      .then((files) => {
        assert.equal(path.resolve(files[0]), path.join(__dirname, './fixtures/aitch.htm'), 'Find HTM (*.*)');
        assert.equal(path.resolve(files[1]), path.join(__dirname, './fixtures/aitch.html'), 'Find HTML (*.*)');
      })
      .catch(error => assert.fail(error));

    lib.file.glob('./plugins/utils/test/fixtures/aitch.html', '.htm', { ignoreExtension: true })
      .then(files => assert.equal(path.resolve(files[0]), path.join(__dirname, './fixtures/aitch.htm'), 'Find HTM (.htm)'))
      .catch(error => assert.fail(error));
  });
});

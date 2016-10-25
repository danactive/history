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
    assert.equal(lib.file.getType('file.type'), 'type', 'Normal type');
    assert.equal(lib.file.getType('.gitignore'), 'gitignore', 'Dot file');
    assert.equal(lib.file.getType('test.eslintrc'), 'eslintrc', 'Long type');
    assert.equal(lib.file.getType('jquery.min.js'), 'js', 'Double type');
    assert.equal(lib.file.getType('image.JPG'), 'jpg', 'Uppercase type');
    assert.equal(lib.file.getType('image.JPeG'), 'jpeg', 'Mixed case type');
    assert.equal(lib.file.getType('word'), '', 'No type');
    assert.equal(lib.file.getType('folder/file.type'), 'type', 'Normal type with relative path (forward slash)');
    assert.equal(lib.file.getType('folder\file.type'), 'type', 'Normal type with relative path (back slash)');
    assert.end();
  });

  describe.test('* File - Get Mime Type', (assert) => {
    assert.equal(lib.file.getMimeType('test.eslintrc'), false, 'Unsupported type');
    assert.equal(lib.file.getMimeType('jquery.min.js'), 'application/javascript', 'JavaScript');
    assert.equal(lib.file.getMimeType('image.JPG'), 'image/jpeg', 'Uppercase JPEG');
    assert.equal(lib.file.getMimeType('image.JPeG'), 'image/jpeg', 'Mixed case JPEG');
    assert.equal(lib.file.getMimeType('word'), false, 'No type');
    assert.equal(lib.file.getMimeType('folder/file.mp4'), 'video/mp4', 'Video type with relative path (forward slash)');
    assert.equal(lib.file.getMimeType('folder\file.webm'), 'video/webm', 'Video type with relative path (back slash)');
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
    assert.equal(test('./plugins/utils/test/'), path.join(__dirname, '\\'),
      'Relative resolved to Absolute folder trailing backslash');
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

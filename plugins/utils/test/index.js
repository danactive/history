const tape = require('tape-catch');

tape('Utilities', { skip: false }, (describe) => {
  const lib = require('../lib');

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
});

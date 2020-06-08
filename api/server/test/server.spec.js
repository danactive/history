const tape = require('tape-catch');

tape('Server', { skip: false }, (describe) => {
  const querystring = require('querystring');
  const wreck = require('@hapi/wreck');

  const config = require('../../../config.json');
  const lib = require('../index');
  const utils = require('../plugins/utils');

  const port = utils.config.get('apiPort');

  async function checkHtml({ assert, html, urlStem }) {
    try {
      const { res: response, payload } = await wreck.get(`http://localhost:${port}${urlStem}`);

      assert.equal(response.statusCode, 200, 'Valid status code');
      assert.ok(payload.toString().includes(html), 'Valid contents');
    } catch (error) {
      assert.fail(error);
    }
  }

  describe.test('* Admin route', async (assert) => {
    const html = 'href="/edit/album">Edit Album</a></li><li><a href="/admin/walk-path">Walk todo';
    const urlStem = '/admin';
    await checkHtml({ assert, html, urlStem });

    assert.end();
  });

  describe.test('* View Album route', async (assert) => {
    const html = 'class="liAlbumPhoto"><div class="albumBoxPhotoImg"><a href="/static/gallery-demo/media/photos/2004/2004-01-04-01.jpg" rel="set"';
    const urlStem = `/view/album?${querystring.stringify({
      gallery: config.defaultGallery,
      album_stem: config.defaultAlbum,
    })}`;
    await checkHtml({ assert, html, urlStem });

    assert.end();
  });

  describe.test('* Edit Album route', async (assert) => {
    const html = '<option value="">Edit these album';
    const urlStem = '/edit/album';
    await checkHtml({ assert, html, urlStem });

    assert.end();
  });

  describe.test('* Explore Video route', async (assert) => {
    const html = 'src="./explore/video/static/lib/lodash.full.m';
    const urlStem = '/explore';
    await checkHtml({ assert, html, urlStem });

    assert.end();
  });

  describe.test('* Home route', async (assert) => {
    const html = '<a href="static/gallery-demo/xml/gallery.xml">demo</a>';
    const urlStem = '/';
    await checkHtml({ assert, html, urlStem });

    assert.end();
  });

  describe.test('* Stop server', async (assert) => {
    lib.stopServer();
    assert.end();
  });
});

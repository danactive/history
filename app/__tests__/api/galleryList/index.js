const fetch = require('node-fetch');

describe('Gallery API', () => {
  const utils = require('../../../../api/server/plugins/utils');
  const port = utils.config.get('nextPort');

  test('* Validate Gallery List route', async () => {
    const endpoint = '/galleryList';
    const url = `http://localhost:${port}/api${endpoint}`;

    const response = await fetch(url);
    expect(response.status).toBe(200);

    const result = await response.json();
    expect(result.galleries.includes('demo')).toBeTruthy();
  });
});

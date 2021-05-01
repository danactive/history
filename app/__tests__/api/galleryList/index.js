import { createMocks } from 'node-mocks-http';

import handleGalleryEndpoint from '../../../pages/api/galleries';

describe('Gallery API', () => {
  const utils = require('../../../../api/server/plugins/utils');
  const port = utils.config.get('nextPort');

  test('* Validate Gallery List route', async () => {
    const { req, res } = createMocks({
      method: 'GET',
      query: {
        animal: 'dog',
      },
    });

    await handleGalleryEndpoint(req, res);
    expect(res._getStatusCode()).toBe(200);

    const result = JSON.parse(res._getData());
    expect(result.galleries.includes('demo')).toBeTruthy();
  });
});

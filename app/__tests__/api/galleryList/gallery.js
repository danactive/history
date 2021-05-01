const lib = require('../../../pages/api/galleries/local');

describe('Gallery Library', () => {
  test('* Get Galleries', async () => {
    const galleries = await lib.getGalleries();
    expect(galleries.length).toBeGreaterThan(0);
    expect(galleries.includes('demo')).toBeTruthy();
  });
});

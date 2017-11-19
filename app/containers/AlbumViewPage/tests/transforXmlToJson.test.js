import { JSDOM } from 'jsdom';

import { parseItemNode } from '../transformXmlToJson';

describe('AlbumViewPage Transform XML to JSON', () => {
  async function getItem() {
    const albumXml = await JSDOM.fromFile('app/containers/AlbumViewPage/tests/fixtures/schema.xml');
    const item = albumXml.window.document.querySelectorAll('item')[0];
    const json = parseItemNode(item);
    return json;
  }

  it('should transform to regular JSON schema', async () => {
    const received = await getItem();
    const expected = {
      id: '100',
      filename: '2017-10-14-20.jpg',
      city: 'Vancouver, BC',
      location: 'YVR Airport',
      description: 'Regular schema',
      geo: [
        -123.183889,
        49.194722,
      ],
      caption: 'Airport',
    };
    expect(received).toEqual(expected);
  });
});

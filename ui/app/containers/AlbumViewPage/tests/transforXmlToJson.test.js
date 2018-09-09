import { JSDOM } from 'jsdom';

import { parseItemNode } from '../transformXmlToJson';

describe('AlbumViewPage Transform XML to JSON', () => {
  async function getItem() {
    const albumXml = await JSDOM.fromFile('fixtures/schema.xml');
    const item = albumXml.window.document.querySelectorAll('item')[0];
    const json = parseItemNode(item);
    return json;
  }

  it('should transform to regular JSON schema', async () => {
    const received = await getItem();
    const expected = {
      caption: 'Airport',
      city: 'Vancouver, BC',
      description: 'Regular schema',
      filename: '2017-10-14-20.jpg',
      id: '100',
      geo: [
        -123.183889,
        49.194722,
      ],
      thumbLink: null,
      location: 'YVR Airport',
    };
    expect(received).toEqual(expected);
  });
});

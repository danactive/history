/* global describe, expect, test */
import { JSDOM } from 'jsdom';
import path from 'path';

import { parseItemNode } from '../transformXmlToJson';

describe('View Album - Transform XML 2.0 to JSON', () => {
  async function getItem() {
    const albumXml = await JSDOM.fromFile(path.resolve(__dirname, './fixtures/schema2.0.xml'));
    const item = albumXml.window.document.querySelectorAll('item')[0];
    const json = parseItemNode(item);
    return json;
  }

  test('should transform to regular JSON schema', async () => {
    const received = await getItem();
    const expected = {
      caption: 'Airport',
      city: 'Vancouver, BC',
      description: 'Regular schema',
      filename: '2017-10-14-20.jpg',
      id: '100',
      coordinates: [
        -123.183889,
        49.194722,
      ],
      photoLink: null,
      thumbLink: null,
      location: 'YVR Airport',
    };
    expect(received).toEqual(expected);
  });
});

describe('View Album - Transform XML 2.1 to JSON', () => {
  async function getItem() {
    const albumXml = await JSDOM.fromFile(path.resolve(__dirname, './fixtures/schema2.1.xml'));
    const item = albumXml.window.document.querySelectorAll('item')[0];
    const json = parseItemNode(item);
    return json;
  }

  test('should transform to regular JSON schema', async () => {
    const received = await getItem();
    const expected = {
      caption: 'Airport',
      city: 'Vancouver, BC',
      description: 'Regular schema',
      filename: '2017-10-14-20.jpg',
      id: '100',
      coordinates: [
        -123.183889,
        49.194722,
      ],
      coordinateAccuracy: 18,
      photoLink: null,
      thumbLink: null,
      location: 'YVR Airport',
    };
    expect(received).toEqual(expected);
  });
});

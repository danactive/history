/* global describe, expect, test */

const { listFiles } = require('../lib/files');

describe('Walk API', () => {
  test('Read files in folder', async () => {
    const { files } = await listFiles('test/fixtures/walkable');
    expect(files[1].filename).toEqual('P1160066.JPG');
    expect(files[1].ext).toEqual('JPG');
    expect(files[1].mediumType).toEqual('image');
    expect(files[1].name).toEqual('P1160066');
    expect(files.length).toEqual(3);
  });

  test('Read files in folder (w/ space)', async () => {
    const { files } = await listFiles('test/fixtures/walk%20able');
    expect(files[0].filename).toEqual('P1160066.JPG');
    expect(files[0].ext).toEqual('JPG');
    expect(files[0].mediumType).toEqual('image');
    expect(files[0].name).toEqual('P1160066');
    expect(files.length).toEqual(1);
  });
});

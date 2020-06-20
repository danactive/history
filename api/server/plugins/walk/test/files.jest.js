/* global describe, expect, test */

const { listFiles } = require('../lib/files');

describe('Walk API', () => {
  function matchFile(expect, file) {
    expect(file.filename).toEqual('P1160066.JPG');
    expect(file.ext).toEqual('JPG');
    expect(file.mediumType).toEqual('image');
    expect(file.name).toEqual('P1160066');
  }

  test('Read files in folder', async () => {
    const { files } = await listFiles('test/fixtures/walkable');
    matchFile(expect, files[1]);
    expect(files.length).toEqual(3);
  });

  test('Read files in folder (w/ space)', async () => {
    const { files } = await listFiles('test/fixtures/walk%20able');
    matchFile(expect, files[0]);
    expect(files.length).toEqual(1);
  });
});

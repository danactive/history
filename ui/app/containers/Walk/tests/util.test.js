/* global beforeEach, describe, expect, test */
import util from '../util';

const {
  addUpFolderPath,
  isImage,
} = util;

describe('Walk - util', () => {
  describe('isImage', () => {
    test('detect JPG', () => {
      expect(isImage({ mediumType: 'image', ext: 'JPEG' })).toEqual(true);
      expect(isImage({ mediumType: 'image', ext: 'jpeg' })).toEqual(true);
      expect(isImage({ mediumType: 'image', ext: 'JPG' })).toEqual(true);
      expect(isImage({ mediumType: 'image', ext: 'jpg' })).toEqual(true);
    });

    test('ignore RAW', () => {
      expect(isImage({ mediumType: 'image', ext: 'RAW' })).toEqual(false);
      expect(isImage({ mediumType: 'image', ext: 'ARW' })).toEqual(false);
    });
  });

  describe('addUpFolderPath', () => {
    const file = {
      filename: '..',
      mediumType: 'folder',
    };
    let dummyFile;

    beforeEach(() => {
      dummyFile = { id: 'testid.js', ext: 'js' };
    });

    test('hide when at root folder', () => {
      expect(addUpFolderPath([dummyFile], null)).toEqual([dummyFile]);
      expect(addUpFolderPath([dummyFile])).toEqual([dummyFile]);
      expect(addUpFolderPath([dummyFile], '')).toEqual([dummyFile]);
    });

    test('one level deep', () => {
      const expectedFile = { ...file, path: '' };
      expect(addUpFolderPath([dummyFile], 'galleries')).toEqual([expectedFile, dummyFile]);
    });

    test('two levels deep', () => {
      const expectedFile = { ...file, path: 'galleries' };
      expect(addUpFolderPath([dummyFile], 'galleries/gallery-demo')).toEqual([expectedFile, dummyFile]);
    });

    test('three levels deep', () => {
      const expectedFile = { ...file, path: 'galleries/gallery-demo' };
      expect(addUpFolderPath([dummyFile], 'galleries/gallery-demo/thumbs')).toEqual([expectedFile, dummyFile]);
    });
  });
});

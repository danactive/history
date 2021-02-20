import {
  determineAdjacentInCarousel,
  argsPhotoXmlPath,
  argsVideoXmlPath,
  replaceThumbToVideo,
} from '../saga';

/* eslint-disable default-case, no-param-reassign */
describe('InfiniteThumbs Saga', () => {
  describe('argsPhotoXmlPath', () => {
    test('JPG', () => {
      const gallery = 'demo';
      const filename = '2021-02-20-50.jpg';
      const expected = {
        path: '/galleries/demo/media/photos/2021/2021-02-20-50.jpg',
      };
      expect(argsPhotoXmlPath({ gallery, filename })).toEqual(expected);
    });

    test('Video', () => {
      const gallery = 'demo';
      const filename = '2021-02-20-50.mp4';
      const expected = {
        path: '/galleries/demo/media/photos/2021/2021-02-20-50.jpg',
      };
      expect(argsPhotoXmlPath({ gallery, filename })).toEqual(expected);
    });
  });

  describe('Video paths', () => {
    test('argsVideoXmlPath', () => {
      const gallery = 'demo';
      const filename = '2021-02-20-50.mp4';
      const expected = {
        path: '/galleries/demo/media/videos/2021/2021-02-20-50.mp4',
      };
      expect(argsVideoXmlPath({ gallery, filename })).toEqual(expected);
    });

    test('replaceThumbToVideo', () => {
      const mediaPath = 'https://cdn/galleries/demo/media';
      const thumbPath = `${mediaPath}/thumbs/2021/2021-02-20-50.jpg`;
      const videoFilename = '2021-02-20-50.mp4';
      const expected = `${mediaPath}/videos/2021/2021-02-20-50.mp4`;
      expect(replaceThumbToVideo(thumbPath, videoFilename)).toEqual(expected);
    });
  });

  describe('determineAdjacentInCarousel', () => {
    describe('Single use input', () => {
      const testState = {
        memories: [{ id: 1 }, { id: 2 }, { id: 3 }],
        currentMemory: {
          id: 2,
        },
      };

      test('should be one after ID two', () => {
        const expected = determineAdjacentInCarousel({
          adjacentInt: 1,
          ...testState,
        });
        expect(expected.id).toEqual(3);
        expect(expected.index).toEqual(2);
      });

      test('should be one before ID two', () => {
        const expected = determineAdjacentInCarousel({
          adjacentInt: -1,
          ...testState,
        });
        expect(expected.id).toEqual(1);
        expect(expected.index).toEqual(0);
      });

      test('should be two after ID two', () => {
        const expected = determineAdjacentInCarousel({
          adjacentInt: 2,
          ...testState,
        });
        expect(expected.id).toEqual(1);
        expect(expected.index).toEqual(0);
      });

      test('should be two before ID two', () => {
        const expected = determineAdjacentInCarousel({
          adjacentInt: -2,
          ...testState,
        });
        expect(expected.id).toEqual(3);
        expect(expected.index).toEqual(2);
      });
    });

    describe('Deeper input', () => {
      const testState = {
        memories: [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }],
        currentMemory: {
          id: 2,
        },
      };

      test('should be one after ID two', () => {
        const expected = determineAdjacentInCarousel({
          adjacentInt: 1,
          ...testState,
        });
        expect(expected.id).toEqual(3);
        expect(expected.index).toEqual(2);
      });

      test('should be two after ID two', () => {
        const expected = determineAdjacentInCarousel({
          adjacentInt: 2,
          ...testState,
        });
        expect(expected.id).toEqual(4);
        expect(expected.index).toEqual(3);
      });
    });
  });
});

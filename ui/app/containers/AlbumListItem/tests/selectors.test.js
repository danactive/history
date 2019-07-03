/* global describe, expect, test */

import {
  selectSection,
  makeSelectGallery,
} from '../selectors';

describe('selectSection', () => {
  test('should select the page state', () => {
    const pageState = {
      gallery: {},
    };
    const mockedState = {
      mediaGallery: {
        galleryViewPage: pageState,
      },
    };
    expect(selectSection(mockedState)).toEqual(pageState);
  });
});

describe('makeSelectGallery', () => {
  const galleriesSelector = makeSelectGallery();
  test('should select the gallery', () => {
    const gallery = 'demo';
    const mockedState = {
      mediaGallery: {
        galleryViewPage: {
          gallery,
        },
      },
    };
    expect(galleriesSelector(mockedState)).toEqual(gallery);
  });
});

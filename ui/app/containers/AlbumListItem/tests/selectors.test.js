/* global describe, expect, test */

import {
  selectPage,
  makeSelectGallery,
} from '../selectors';

describe('selectPage', () => {
  test('should select the page state', () => {
    const pageState = {
      gallery: {},
    };
    const mockedState = {
      galleryViewPage: pageState,
    };
    expect(selectPage(mockedState)).toEqual(pageState);
  });
});

describe('makeSelectGallery', () => {
  const galleriesSelector = makeSelectGallery();
  test('should select the gallery', () => {
    const gallery = 'demo';
    const mockedState = {
      galleryViewPage: {
        gallery,
      },
    };
    expect(galleriesSelector(mockedState)).toEqual(gallery);
  });
});

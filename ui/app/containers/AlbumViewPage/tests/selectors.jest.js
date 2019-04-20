/* global describe, expect, test */
import { fromJS } from 'immutable';

import {
  selectAlbum,
  selectPage,
  makeSelectAlbumLoading,
  makeSelectMemories,
  selectNextPage,
} from '../selectors';

describe('Memorized selectors', () => {
  test('should select the album view page state', () => {
    const pageState = fromJS({
      albumLoading: false,
    });
    const mockedState = fromJS({
      albumViewPage: pageState,
    });
    const received = selectPage(mockedState);
    const expected = pageState;
    expect(received).toEqual(expected);
  });

  test('should select the album state', () => {
    const albumState = fromJS({
      thumbs: [],
    });
    const mockedState = fromJS({
      albums: albumState,
    });
    const received = selectAlbum(mockedState);
    const expected = albumState;
    expect(received).toEqual(expected);
  });
});

describe('makeSelectAlbumLoading', () => {
  const albumLoadingSelector = makeSelectAlbumLoading();
  test('should select the album loading boolean', () => {
    const mockedState = fromJS({
      albumViewPage: {
        albumLoading: false,
      },
    });
    expect(albumLoadingSelector(mockedState)).toEqual(false);
  });
});

describe('makeSelectMemories', () => {
  const memoriesSelector = makeSelectMemories();
  test('should select the album memories', () => {
    const mockedState = fromJS({
      albums: {
        gallery: 'demo',
        album: 'sample',
        demo: {
          sample: {
            memories: [{ filename: '2017-12-25.jpg' }],
          },
        },
      },
    });
    const expected = fromJS([{ filename: '2017-12-25.jpg' }]);
    expect(memoriesSelector(mockedState)).toEqual(expected);
  });
});

describe('selectNextPage', () => {
  test('should select the next page', () => {
    const mockedState = fromJS({
      albumViewPage: {
        page: 1,
      },
      albums: {
        gallery: 'demo',
        album: 'sample',
        demo: {
          sample: {
            memories: [],
          },
        },
      },
    });
    const expected = {
      gallery: 'demo',
      album: 'sample',
      memories: fromJS([]),
      page: 1,
    };
    expect(selectNextPage(mockedState)).toEqual(expected);
  });
});

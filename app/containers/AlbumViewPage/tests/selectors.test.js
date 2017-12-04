import { fromJS } from 'immutable';

import {
  selectAlbum,
  selectPage,
  makeSelectAlbumLoading,
  makeSelectThumbs,
  makeSelectNextPage,
} from '../selectors';

describe('Memorized selectors', () => {
  it('should select the album view page state', () => {
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

  it('should select the album state', () => {
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
  it('should select the album loading boolean', () => {
    const mockedState = fromJS({
      albumViewPage: {
        albumLoading: false,
      },
    });
    expect(albumLoadingSelector(mockedState)).toEqual(false);
  });
});

describe('makeSelectThumbs', () => {
  const thumbsSelector = makeSelectThumbs();
  it('should select the album thumbs', () => {
    const mockedState = fromJS({
      albums: {
        gallery: 'demo',
        album: 'sample',
        demo: {
          sample: {
            thumbs: [{ filename: '2017-12-25.jpg' }],
          },
        },
      },
    });
    const expected = [{ filename: '2017-12-25.jpg' }];
    expect(thumbsSelector(mockedState)).toEqual(expected);
  });
});

describe('makeSelectNextPage', () => {
  const nextPageSelector = makeSelectNextPage();
  it('should select the next page', () => {
    const mockedState = fromJS({
      albumViewPage: {
        page: 1,
      },
      albums: {
        gallery: 'demo',
        album: 'sample',
        demo: {
          sample: {
            thumbs: [],
            metaThumbs: [],
          },
        },
      },
    });
    const expected = {
      gallery: 'demo',
      album: 'sample',
      thumbs: fromJS([]),
      metaThumbs: fromJS([]),
      page: 1,
    };
    expect(nextPageSelector(mockedState)).toEqual(expected);
  });
});

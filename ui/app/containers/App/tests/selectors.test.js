import {
  selectPage,
  makeSelectCurrentMemory,
  makeSelectThumbsError,
  makeSelectThumbsLoading,
} from '../selectors';

describe('selectPage', () => {
  test('should select the page state', () => {
    const pageState = {
      albums: '',
    };
    const mockedState = {
      albumViewPage: pageState,
    };
    expect(selectPage(mockedState)).toEqual(pageState);
  });
});

describe('makeSelectCurrentMemory', () => {
  test('should select the current memory', () => {
    const currentMemorySelector = makeSelectCurrentMemory();
    const globalState = {
      host: 'dropbox',
      gallery: 'demo',
      album: 'sample',
      currentMemory: null,
    };
    const mockedState = {
      global: globalState,
    };
    expect(currentMemorySelector(mockedState)).toEqual(globalState);
  });
});

describe('makeSelectThumbsLoading', () => {
  const galleryErrorSelector = makeSelectThumbsLoading();
  test('should select the error status', () => {
    const thumbsLoading = true;
    const mockedState = {
      albumViewPage: {
        thumbsLoading,
      },
    };
    expect(galleryErrorSelector(mockedState)).toEqual(thumbsLoading);
  });
});

describe('makeSelectThumbsError', () => {
  const galleryLoadingSelector = makeSelectThumbsError();
  test('should select the loading status', () => {
    const thumbsError = true;
    const mockedState = {
      albumViewPage: {
        thumbsError,
      },
    };
    expect(galleryLoadingSelector(mockedState)).toEqual(thumbsError);
  });
});

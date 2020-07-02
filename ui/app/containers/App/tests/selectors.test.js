import {
  selectPage,
  selectCurrentMemory,
  selectThumbsError,
  selectThumbsLoading,
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

describe('selectCurrentMemory', () => {
  test('should select the current memory', () => {
    const globalState = {
      host: 'dropbox',
      gallery: 'demo',
      album: 'sample',
      currentMemory: null,
    };
    const mockedState = {
      global: globalState,
    };
    expect(selectCurrentMemory(mockedState)).toEqual(globalState);
  });
});

describe('selectThumbsLoading', () => {
  test('should select the error status', () => {
    const thumbsLoading = true;
    const mockedState = {
      albumViewPage: {
        thumbsLoading,
      },
    };
    expect(selectThumbsLoading(mockedState)).toEqual(thumbsLoading);
  });
});

describe('selectThumbsError', () => {
  test('should select the loading status', () => {
    const thumbsError = true;
    const mockedState = {
      albumViewPage: {
        thumbsError,
      },
    };
    expect(selectThumbsError(mockedState)).toEqual(thumbsError);
  });
});

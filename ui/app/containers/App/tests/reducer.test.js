import produce from 'immer';

import appReducer, { initialState } from '../reducer';
import { albumLoadSuccess, loadAlbum } from '../../AlbumViewPage/actions';
import json from './fixtures/album.json';

/* eslint-disable default-case, no-param-reassign */
describe('appReducer', () => {
  let state;

  beforeEach(() => {
    state = initialState;
  });

  test('initial state', () => {
    expect(appReducer(undefined, {})).toStrictEqual(initialState);
  });

  test('loadAlbum action from AlbumViewPage', () => {
    const received = appReducer(
      state,
      loadAlbum({ host: 'dropbox', gallery: 'demo', album: 'sample' }),
    );

    const expected = produce(state, draft => {
      draft.album = 'sample';
      draft.gallery = 'demo';
      draft.host = 'dropbox';
      draft.dropbox = {
        demo: {
          sample: {
            memories: [],
          },
        },
      };
    });

    expect(received).toStrictEqual(expected);
  });

  test('albumLoadSuccess action', () => {
    const testState = {
      host: 'dropbox',
      gallery: 'demo',
      album: 'sample',
    };
    const received = appReducer(
      testState,
      albumLoadSuccess({
        host: testState.host,
        gallery: testState.gallery,
        album: testState.album,
        memories: json.memories,
      }),
    );

    const expected = produce(testState, draft => {
      draft.dropbox = {
        demo: {
          sample: {
            memories: json.memories,
          },
        },
      };
    });

    expect(received).toStrictEqual(expected);
  });
});

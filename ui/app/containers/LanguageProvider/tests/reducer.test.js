/* global describe, expect, test */
import { fromJS } from 'immutable';

import languageProviderReducer from '../reducer';
import CHANGE_LOCALE from '../constants';

describe('languageProviderReducer', () => {
  test('returns the initial state', () => {
    expect(languageProviderReducer(undefined, {})).toEqual(
      fromJS({
        locale: 'en',
      }),
    );
  });

  test('changes the locale', () => {
    expect(
      languageProviderReducer(undefined, {
        type: CHANGE_LOCALE,
        locale: 'de',
      }).toJS(),
    ).toEqual({
      locale: 'de',
    });
  });
});

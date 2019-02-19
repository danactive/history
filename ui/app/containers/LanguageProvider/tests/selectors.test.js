/* global describe, expect, test */
import { fromJS } from 'immutable';

import { selectLanguage } from '../selectors';

describe('selectLanguage', () => {
  test('should select the global state', () => {
    const globalState = fromJS({});
    const mockedState = fromJS({
      language: globalState,
    });
    expect(selectLanguage(mockedState)).toEqual(globalState);
  });
});

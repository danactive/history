/* global describe, expect, test */
import { selectLanguage } from '../selectors';

describe('selectLanguage', () => {
  test('should select the global state', () => {
    const globalState = {};
    const mockedState = {
      language: globalState,
    };
    expect(selectLanguage(mockedState)).toEqual(globalState);
  });
});

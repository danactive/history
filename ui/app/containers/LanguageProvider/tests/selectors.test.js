import { selectLanguage } from '../selectors';
import { initialState } from '../reducer';

describe('selectLanguage', () => {
  test('should select the language state', () => {
    const languageState = {};
    const mockedState = {
      language: languageState,
    };
    expect(selectLanguage(mockedState)).toEqual(languageState);
  });

  test('should select the initial state when state is missing', () => {
    const mockedState = {};
    expect(selectLanguage(mockedState)).toEqual(initialState);
  });
});

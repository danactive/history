import { CHANGE_LOCALE } from './constants';

export function changeLocale(languageLocale) { // eslint-disable-line
  return {
    type: CHANGE_LOCALE,
    locale: languageLocale,
  };
}

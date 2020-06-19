/* eslint-disable import/prefer-default-export */
import { CHANGE_LOCALE } from './constants';

export function changeLocale(languageLocale) {
  return {
    type: CHANGE_LOCALE,
    locale: languageLocale,
  };
}

/*
 *
 * LanguageProvider
 *
 * This component connects the redux state language locale to the
 * IntlProvider component and i18n messages (loaded from `app/translations`)
 */

import React from 'react';
import { useSelector } from 'react-redux';
import { createSelector } from 'reselect';
import { IntlProvider } from 'react-intl';

import { makeSelectLocale } from './selectors';

const stateSelector = createSelector(makeSelectLocale(), locale => ({
  locale,
}));

export default function LanguageProvider(props) {
  const { locale } = useSelector(stateSelector);
  return (
    <IntlProvider locale={locale} messages={props.messages[locale]}>
      {React.Children.only(props.children)}
    </IntlProvider>
  );
}

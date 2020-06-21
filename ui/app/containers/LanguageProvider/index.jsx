import React from 'react';
import { useSelector } from 'react-redux';
import { createSelector } from 'reselect';
import { IntlProvider } from 'react-intl';

import { makeSelectLocale } from './selectors';

const stateSelector = createSelector(makeSelectLocale(), locale => ({
  locale,
}));

export default function LanguageProvider({ children, messages }) {
  const { locale } = useSelector(stateSelector);
  return (
    <IntlProvider locale={locale} messages={messages[locale]}>
      {React.Children.only(children)}
    </IntlProvider>
  );
}

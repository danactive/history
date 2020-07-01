import React from 'react';
import { useSelector } from 'react-redux';
import { IntlProvider } from 'react-intl';

import { selectLocale } from './selectors';

export default function LanguageProvider({ children, messages }) {
  const locale = useSelector(selectLocale);
  return (
    <IntlProvider locale={locale} messages={messages[locale]}>
      {React.Children.only(children)}
    </IntlProvider>
  );
}

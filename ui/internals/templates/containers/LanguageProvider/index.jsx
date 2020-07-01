/*
 *
 * LanguageProvider
 *
 * This component connects the redux state language locale to the
 * IntlProvider component and i18n messages (loaded from `app/translations`)
 */

import React from 'react';
import { IntlProvider } from 'react-intl';
import { useSelector } from 'react-redux';

import { selectLocale } from './selectors';

export default function LanguageProvider(props) {
  const locale = useSelector(selectLocale);
  return (
    <IntlProvider locale={locale} messages={props.messages[locale]}>
      {React.Children.only(props.children)}
    </IntlProvider>
  );
}

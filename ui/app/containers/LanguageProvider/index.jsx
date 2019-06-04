import React from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import { IntlProvider } from 'react-intl';

import { makeSelectLocale } from './selectors';

export function LanguageProvider({
  children,
  locale,
  messages,
}) {
  return (
    <IntlProvider
      locale={locale}
      key={locale}
      messages={messages[locale]}
    >
      {React.Children.only(children)}
    </IntlProvider>
  );
}


const mapStateToProps = createSelector(makeSelectLocale(), locale => ({
  locale,
}));

export default connect(mapStateToProps)(LanguageProvider);

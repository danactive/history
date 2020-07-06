import React from 'react';
import { useSelector, useDispatch } from 'react-redux';

import Toggle from '../../components/Toggle';
import Wrapper from './Wrapper';
import messages from './messages';
import { appLocales } from '../../locales';
import { changeLocale } from '../LanguageProvider/actions';
import { selectLocale } from '../LanguageProvider/selectors';

export default function LocaleToggle() {
  const dispatch = useDispatch();
  const locale = useSelector(selectLocale);

  const onLocaleToggle = evt => dispatch(changeLocale(evt.target.value));

  return (
    <Wrapper>
      <Toggle
        value={locale}
        values={appLocales}
        messages={messages}
        onToggle={onLocaleToggle}
      />
    </Wrapper>
  );
}

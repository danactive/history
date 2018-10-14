import React from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';

import Toggle from '../../components/Toggle';
import Wrapper from './Wrapper';
import messages from './messages';
import { appLocales } from '../../i18n';
import { changeLocale } from '../LanguageProvider/actions';
import { makeSelectLocale } from '../LanguageProvider/selectors';

export class LocaleToggle extends React.PureComponent {
  render() {
    const {
      locale,
      onLocaleToggle,
    } = this.props;

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
}

const mapStateToProps = createSelector(makeSelectLocale(), locale => ({
  locale,
}));

export function mapDispatchToProps(dispatch) {
  return {
    onLocaleToggle: evt => dispatch(changeLocale(evt.target.value)),
    dispatch,
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(LocaleToggle);

/* global beforeAll, describe, jest, expect, test */
import React from 'react';
import { Provider } from 'react-redux';
import { browserHistory } from 'react-router-dom';
import { render } from 'react-testing-library';

import LocaleToggleComponent, { mapDispatchToProps } from '../index';
import { changeLocale } from '../../LanguageProvider/actions';
import LanguageProviderComponent from '../../LanguageProvider';

import configureStore from '../../../configureStore';
import { translationMessages } from '../../../i18n';

describe('<LocaleToggle />', () => {
  let store;

  beforeAll(() => {
    store = configureStore({}, browserHistory);
  });

  test('should match the snapshot', () => {
    const { container } = render(
      <Provider store={store}>
        <LanguageProviderComponent messages={translationMessages}>
          <LocaleToggleComponent />
        </LanguageProviderComponent>
      </Provider>,
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  test('should present the default `en` english language option', () => {
    const { container } = render(
      <Provider store={store}>
        <LanguageProviderComponent messages={translationMessages}>
          <LocaleToggleComponent />
        </LanguageProviderComponent>
      </Provider>,
    );
    expect(container.querySelector('option[value="en"]')).not.toBeNull();
  });

  describe('mapDispatchToProps', () => {
    describe('onLocaleToggle', () => {
      test('should be injected', () => {
        const dispatch = jest.fn();
        const result = mapDispatchToProps(dispatch);
        expect(result.onLocaleToggle).toBeDefined();
      });

      test.skip('should dispatch changeLocale when called', () => {
        const dispatch = jest.fn();
        const result = mapDispatchToProps(dispatch);
        const locale = 'de';
        const evt = { target: { value: locale } };
        result.onLocaleToggle(evt);
        expect(dispatch).toHaveBeenCalledWith(changeLocale(locale));
      });
    });
  });
});

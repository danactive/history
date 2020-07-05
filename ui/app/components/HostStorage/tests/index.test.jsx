import React from 'react';
import { render } from '@testing-library/react';
import { IntlProvider } from 'react-intl';

import HostStorage from '../index';
import { DEFAULT_LOCALE } from '../../../locales';

describe('<HostStorage />', () => {
  test('Expect to not log errors in console', () => {
    const spy = jest.spyOn(global.console, 'error');
    render(
      <IntlProvider locale={DEFAULT_LOCALE}>
        <HostStorage />
      </IntlProvider>,
    );
    expect(spy).not.toHaveBeenCalled();
  });

  test('Should render and match the snapshot', () => {
    const {
      container: { firstChild },
    } = render(
      <IntlProvider locale={DEFAULT_LOCALE}>
        <HostStorage />
      </IntlProvider>,
    );
    expect(firstChild).toMatchSnapshot();
  });
});

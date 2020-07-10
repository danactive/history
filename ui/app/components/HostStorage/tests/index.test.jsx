import React from 'react';
import { fireEvent, render, act } from '@testing-library/react';
import { IntlProvider } from 'react-intl';

import HostStorage from '../index';
import { apiPort } from '../../../../../config.json';
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

  test('Form validation should prevent blank', async () => {
    const { getByLabelText, getByTestId } = render(<HostStorage host="cdn" />);

    await act(async () => {
      fireEvent.change(getByLabelText('Token input'), {
        target: { value: '' },
      });
    });

    await act(async () => {
      fireEvent.submit(getByTestId('form'));
    });

    expect(getByLabelText('Token error').innerHTML).toBe(
      'Invalid token (min 10 char) or URL',
    );
  });

  test('Should allow a localhost URL', async () => {
    const { getByLabelText, getByTestId } = render(<HostStorage host="cdn" />);

    await act(async () => {
      fireEvent.change(getByLabelText('Token input'), {
        target: { value: `http://localhost:${apiPort}` },
      });
    });

    await act(async () => {
      fireEvent.submit(getByTestId('form'));
    });

    expect(getByLabelText('success').innerHTML).toBe('✅');
  });
});

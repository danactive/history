/* global describe, expect, test */
import React from 'react';
import { render } from 'react-testing-library';
import { IntlProvider, defineMessages } from 'react-intl';

import ToggleOption from '..';

describe('<ToggleOption />', () => {
  test('should render default language messages', () => {
    const defaultEnMessage = 'someContent';
    const message = defineMessages({
      enMessage: {
        id: 'boilerplate.containers.LocaleToggle.en',
        defaultMessage: defaultEnMessage,
      },
    });
    const { container } = render(
      <IntlProvider locale="en">
        <ToggleOption value="en" message={message.enMessage} />
      </IntlProvider>,
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  test('should display `value`(two letter language code) when `message` is absent', () => {
    const { queryByText } = render(
      <IntlProvider locale="de">
        <ToggleOption value="de" />
      </IntlProvider>,
    );
    expect(queryByText('de')).toBeDefined();
  });
});

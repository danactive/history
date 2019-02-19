/* global describe, expect, test */
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { shallow } from 'enzyme';

import NotFoundPage from '..';
import messages from '../messages';

describe('<NotFoundPage />', () => {
  test('should render the page message', () => {
    const renderedComponent = shallow(<NotFoundPage />);
    expect(
      renderedComponent.contains(<FormattedMessage {...messages.header} />),
    ).toEqual(true);
  });
});

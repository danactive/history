/* global describe, expect, test */
import React from 'react';
import { shallow } from 'enzyme';
import { FormattedMessage } from 'react-intl';

import A from '../../A';
import messages from '../messages';
import Footer from '..';

describe('<Footer />', () => {
  test('should render the copyright notice', () => {
    const renderedComponent = shallow(<Footer />);
    expect(
      renderedComponent.contains(
        <section>
          <FormattedMessage {...messages.licenseMessage} />
        </section>,
      ),
    ).toBe(true);
  });

  test('should render the credits', () => {
    const renderedComponent = shallow(<Footer />);
    expect(
      renderedComponent.contains(
        <section>
          <FormattedMessage
            {...messages.authorMessage}
            values={{
              author: <A href="https://twitter.com/danactive">Dan BROOKS</A>,
            }}
          />
        </section>,
      ),
    ).toBe(true);
  });
});

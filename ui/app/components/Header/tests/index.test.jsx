/* global describe, expect, test */
import React from 'react';
import { shallow } from 'enzyme';

import Header from '..';

describe('<Header />', () => {
  test('should render a div', () => {
    const renderedComponent = shallow(<Header />);
    expect(renderedComponent.find('div')).toHaveLength(1);
  });
});

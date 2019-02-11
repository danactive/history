/* global describe, expect, test, shallow */
import React from 'react';

import SlippyMap from '../index';

const shallowComponent = (props = {}) => shallow(<SlippyMap {...props} />);

describe('<SlippyMap />', () => {
  test('should render an <SlippyMap /> component', () => {
    expect.hasAssertions();

    const received = shallowComponent().children().length;
    const expected = 5;
    expect(received).toEqual(expected);
  });
});

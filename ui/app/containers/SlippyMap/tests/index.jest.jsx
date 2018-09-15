/* global describe, expect, jest, it, shallow */
import React from 'react';

import SlippyMap from '../index';

jest.mock('react-mapbox-gl', () => jest.fn(() => {}));

const shallowComponent = (props = {}) => shallow(<SlippyMap {...props} />);

describe('<SlippyMap />', () => {
  it('should render an <SlippyMap /> component', () => {
    expect.hasAssertions();

    const received = shallowComponent().children().length;
    const expected = 5;
    expect(received).toEqual(expected);
  });
});

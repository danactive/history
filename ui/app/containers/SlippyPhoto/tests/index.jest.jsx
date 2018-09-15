/* global describe, expect, jest, it, shallow */
import React from 'react';

import SlippyPhoto from '../index';

jest.mock('react-mapbox-gl', () => jest.fn(() => {}));

const shallowComponent = (props = {}) => shallow(<SlippyPhoto {...props} />);

describe('<SlippyPhoto />', () => {
  it('should render an <SlippyPhoto /> component', () => {
    expect.hasAssertions();

    const received = shallowComponent().children().length;
    const expected = 0;
    expect(received).toEqual(expected);
  });
});

/* global describe, expect, test */
import React from 'react';
import { shallow } from 'enzyme';

import PhotoHeader from '..';

const shallowComponent = (props = {}) => shallow(
  <PhotoHeader {...props} />,
);

describe('<PhotoHeader />', () => {
  test('should show nothing when no current memory', () => {
    const component = shallowComponent();
    expect(component.type()).toEqual(null);
  });

  test('should show nothing when no current memory', () => {
    const component = shallowComponent({ currentMemory: null });
    expect(component.type()).toEqual(null);
  });

  test('should have a city', () => {
    const city = 'Vancouver';
    const component = shallowComponent({ currentMemory: { city } });
    expect(component.contains(city)).toEqual(true);
  });
});

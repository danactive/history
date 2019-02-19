/* global describe, expect, mount, test */
import React from 'react';
import { enzymeFind } from 'styled-components/test-utils';

import Select from '../Select';

describe('<Select />', () => {
  test('should render an <select> tag', () => {
    const wrapper = mount(<Select />);
    const renderedComponent = enzymeFind(wrapper, Select);
    expect(renderedComponent.type()).toEqual('select');
  });

  test('should have a className attribute', () => {
    const wrapper = mount(<Select />);
    const renderedComponent = enzymeFind(wrapper, Select);
    expect(renderedComponent.prop('className')).toBeDefined();
  });

  test('should adopt a valid attribute', () => {
    const id = 'test';
    const wrapper = mount(<Select id={id} />);
    const renderedComponent = enzymeFind(wrapper, Select);
    expect(renderedComponent.prop('id')).toEqual(id);
  });

  test('should not adopt an invalid attribute', () => {
    const wrapper = mount(<Select attribute="test" />);
    const renderedComponent = enzymeFind(wrapper, Select);
    expect(renderedComponent.prop('attribute')).toBeUndefined();
  });
});

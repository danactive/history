/* global describe, expect, test */
import React from 'react';
import { mount } from 'enzyme';
import { enzymeFind } from 'styled-components/test-utils';

import A from '../A';

describe('<A />', () => {
  test('should render an <a> tag', () => {
    const wrapper = mount(<A />);
    const renderedComponent = enzymeFind(wrapper, A);
    expect(renderedComponent.type()).toEqual('a');
  });

  test('should have a className attribute', () => {
    const wrapper = mount(<A />);
    const renderedComponent = enzymeFind(wrapper, A);
    expect(renderedComponent.prop('className')).toBeDefined();
  });

  test('should adopt a valid attribute', () => {
    const id = 'test';
    const wrapper = mount(<A id={id} />);
    const renderedComponent = enzymeFind(wrapper, A);
    expect(renderedComponent.prop('id')).toEqual(id);
  });

  test('should not adopt an invalid attribute', () => {
    const wrapper = mount(<A attribute="test" />);
    const renderedComponent = enzymeFind(wrapper, A);
    expect(renderedComponent.prop('attribute')).toBeUndefined();
  });
});

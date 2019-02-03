/* global describe, expect, test */
import React from 'react';
import { mount } from 'enzyme';
import { enzymeFind } from 'styled-components/test-utils';

import Wrapper from '../Wrapper';

describe('<Wrapper />', () => {
  test('should render an <div> tag', () => {
    const wrapper = mount(<Wrapper />);
    const renderedComponent = enzymeFind(wrapper, Wrapper);
    expect(renderedComponent.type()).toEqual('div');
  });

  test('should have a className attribute', () => {
    const wrapper = mount(<Wrapper />);
    const renderedComponent = enzymeFind(wrapper, Wrapper);
    expect(renderedComponent.prop('className')).toBeDefined();
  });

  test('should adopt a valid attribute', () => {
    const id = 'test';
    const wrapper = mount(<Wrapper id={id} />);
    const renderedComponent = enzymeFind(wrapper, Wrapper);
    expect(renderedComponent.prop('id')).toEqual(id);
  });

  test('should not adopt an invalid attribute', () => {
    const wrapper = mount(<Wrapper attribute="test" />);
    const renderedComponent = enzymeFind(wrapper, Wrapper);
    expect(renderedComponent.prop('attribute')).toBeUndefined();
  });
});

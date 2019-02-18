/* global describe, expect, test */
import React from 'react';
import { mount } from 'enzyme';
import { enzymeFind } from 'styled-components/test-utils';

import StyledButton from '../StyledButton';

describe('<StyledButton />', () => {
  test('should render an <button> tag', () => {
    const wrapper = mount(<StyledButton />);
    const renderedComponent = enzymeFind(wrapper, StyledButton);
    expect(renderedComponent.type()).toEqual('button');
  });

  test('should have a className attribute', () => {
    const wrapper = mount(<StyledButton />);
    const renderedComponent = enzymeFind(wrapper, StyledButton);
    expect(renderedComponent.prop('className')).toBeDefined();
  });

  test('should adopt a valid attribute', () => {
    const id = 'test';
    const wrapper = mount(<StyledButton id={id} />);
    const renderedComponent = enzymeFind(wrapper, StyledButton);
    expect(renderedComponent.prop('id')).toEqual(id);
  });

  test('should not adopt an invalid attribute', () => {
    const wrapper = mount(<StyledButton attribute="test" />);
    const renderedComponent = enzymeFind(wrapper, StyledButton);
    expect(renderedComponent.prop('attribute')).toBeUndefined();
  });
});

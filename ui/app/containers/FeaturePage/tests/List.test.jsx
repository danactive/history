/* global describe, expect, mount, test */
import React from 'react';
import { enzymeFind } from 'styled-components/test-utils';

import List from '../List';

describe('<List />', () => {
  test('should render an <ul> tag', () => {
    const wrapper = mount(<List />);
    const renderedComponent = enzymeFind(wrapper, List);
    expect(renderedComponent.type()).toEqual('ul');
  });

  test('should have a className attribute', () => {
    const wrapper = mount(<List />);
    const renderedComponent = enzymeFind(wrapper, List);
    expect(renderedComponent.prop('className')).toBeDefined();
  });

  test('should adopt a valid attribute', () => {
    const id = 'test';
    const wrapper = mount(<List id={id} />);
    const renderedComponent = enzymeFind(wrapper, List);
    expect(renderedComponent.prop('id')).toEqual(id);
  });

  test('should not adopt an invalid attribute', () => {
    const wrapper = mount(<List attribute="test" />);
    const renderedComponent = enzymeFind(wrapper, List);
    expect(renderedComponent.prop('attribute')).toBeUndefined();
  });
});

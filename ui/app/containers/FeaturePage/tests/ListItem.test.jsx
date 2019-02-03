/* global describe, expect, mount, test */
import React from 'react';
import { enzymeFind } from 'styled-components/test-utils';

import ListItem from '../ListItem';

describe('<ListItem />', () => {
  test('should render an <li> tag', () => {
    const wrapper = mount(<ListItem />);
    const renderedComponent = enzymeFind(wrapper, ListItem);
    expect(renderedComponent.type()).toEqual('li');
  });

  test('should have a className attribute', () => {
    const wrapper = mount(<ListItem />);
    const renderedComponent = enzymeFind(wrapper, ListItem);
    expect(renderedComponent.prop('className')).toBeDefined();
  });

  test('should adopt a valid attribute', () => {
    const id = 'test';
    const wrapper = mount(<ListItem id={id} />);
    const renderedComponent = enzymeFind(wrapper, ListItem);
    expect(renderedComponent.prop('id')).toEqual(id);
  });

  test('should not adopt an invalid attribute', () => {
    const wrapper = mount(<ListItem attribute="test" />);
    const renderedComponent = enzymeFind(wrapper, ListItem);
    expect(renderedComponent.prop('attribute')).toBeUndefined();
  });
});

/* global describe, expect, mount, test */
import React from 'react';
import { enzymeFind } from 'styled-components/test-utils';

import ListItemTitle from '../ListItemTitle';

describe('<ListItemTitle />', () => {
  test('should render an <p> tag', () => {
    const wrapper = mount(<ListItemTitle />);
    const renderedComponent = enzymeFind(wrapper, ListItemTitle);
    expect(renderedComponent.type()).toEqual('p');
  });

  test('should have a className attribute', () => {
    const wrapper = mount(<ListItemTitle />);
    const renderedComponent = enzymeFind(wrapper, ListItemTitle);
    expect(renderedComponent.prop('className')).toBeDefined();
  });

  test('should adopt a valid attribute', () => {
    const id = 'test';
    const wrapper = mount(<ListItemTitle id={id} />);
    const renderedComponent = enzymeFind(wrapper, ListItemTitle);
    expect(renderedComponent.prop('id')).toEqual(id);
  });

  test('should not adopt an invalid attribute', () => {
    const wrapper = mount(<ListItemTitle attribute="test" />);
    const renderedComponent = enzymeFind(wrapper, ListItemTitle);
    expect(renderedComponent.prop('attribute')).toBeUndefined();
  });
});

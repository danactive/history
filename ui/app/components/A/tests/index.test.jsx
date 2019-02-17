/* global describe, expect, test */
/**
 * Testing our link component
 */

import React from 'react';
import { mount } from 'enzyme';
import { enzymeFind } from 'styled-components/test-utils';

import A from '../index';

const href = 'http://mxstbr.com/';
const children = <h1>Test</h1>;
const renderComponent = (props = {}) => {
  const wrapper = mount(
    <A href={href} {...props}>
      {children}
    </A>,
  );

  return enzymeFind(wrapper, A);
};

describe('<A />', () => {
  test('should render an <a> tag', () => {
    const renderedComponent = renderComponent();
    expect(renderedComponent.type()).toEqual('a');
  });

  test('should have an href attribute', () => {
    const renderedComponent = renderComponent();
    expect(renderedComponent.prop('href')).toEqual(href);
  });

  test('should have children', () => {
    const renderedComponent = renderComponent();
    expect(renderedComponent.contains(children)).toEqual(true);
  });

  test('should have a className attribute', () => {
    const className = 'test';
    const renderedComponent = renderComponent({ className });
    expect(renderedComponent.find('a').hasClass(className)).toEqual(true);
  });

  test('should adopt a target attribute', () => {
    const target = '_blank';
    const renderedComponent = renderComponent({ target });
    expect(renderedComponent.prop('target')).toEqual(target);
  });

  test('should adopt a type attribute', () => {
    const type = 'text/html';
    const renderedComponent = renderComponent({ type });
    expect(renderedComponent.prop('type')).toEqual(type);
  });
});

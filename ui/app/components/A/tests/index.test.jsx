/* global describe, expect, test */
/**
 * Testing our link component
 */

import React from 'react';
import { render } from 'react-testing-library';

import A from '../index';

const href = 'http://mxstbr.com/';
const children = <h1>Test</h1>;
const renderComponent = (props = {}) => render(
  <A href={href} {...props}>
    {children}
  </A>,
);

describe('<A />', () => {
  test('should render an <a> tag', () => {
    const { container } = renderComponent();
    expect(container.querySelector('a')).not.toBeNull();
  });

  test('should have an href attribute', () => {
    const { container } = renderComponent();
    expect(container.querySelector('a').href).toEqual(href);
  });

  test('should have children', () => {
    const { container } = renderComponent();
    expect(container.querySelector('a').children).toHaveLength(1);
  });

  test('should have a class attribute', () => {
    const className = 'test';
    const { container } = renderComponent({ className });
    expect(container.querySelector('a').classList).toContain(className);
  });

  test('should adopt a target attribute', () => {
    const target = '_blank';
    const { container } = renderComponent({ target });
    expect(container.querySelector('a').target).toEqual(target);
  });

  test('should adopt a type attribute', () => {
    const type = 'text/html';
    const { container } = renderComponent({ type });
    expect(container.querySelector('a').type).toEqual(type);
  });
});

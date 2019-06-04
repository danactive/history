/* global describe, expect, jest, test */
/**
 * Testing our Button component
 */

import React from 'react';
import { fireEvent, render } from 'react-testing-library';

import Button from '..';

const handleRoute = () => {};
const href = 'http://mxstbr.com';
const children = <h1>Test</h1>;
const renderComponent = (props = {}) =>
  render(
    <Button href={href} {...props}>
      {children}
    </Button>,
  );

describe('<Button />', () => {
  test('should render an <a> tag if no route is specified', () => {
    const { container } = renderComponent({ href });
    expect(container.querySelector('a')).not.toBeNull();
  });

  test('should render a <button> tag to change route if the handleRoute prop is specified', () => {
    const { container } = renderComponent({ handleRoute });
    expect(container.querySelector('button')).toBeDefined();
  });

  test('should have children', () => {
    const { container } = renderComponent();
    expect(container.querySelector('a').children).toHaveLength(1);
  });

  test('should handle click events', () => {
    const onClickSpy = jest.fn();
    const { container } = renderComponent({ onClick: onClickSpy });
    fireEvent.click(container.querySelector('a'));
    expect(onClickSpy).toHaveBeenCalled();
  });

  test('should have a class attribute', () => {
    const { container } = renderComponent();
    expect(container.querySelector('a').hasAttribute('class')).toBe(true);
  });

  test('should not adopt a type attribute when rendering an <a> tag', () => {
    const type = 'text/html';
    const { container } = renderComponent({ href, type });
    expect(container.querySelector(`a[type="${type}"]`)).toBeNull();
  });

  test('should not adopt a type attribute when rendering a button', () => {
    const type = 'submit';
    const { container } = renderComponent({ handleRoute, type });
    expect(container.querySelector('button').getAttribute('type')).toBeNull();
  });
});

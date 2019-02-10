/* global describe, expect, test */
/**
 * Testing our Button component
 */

import React from 'react';
import { mount } from 'enzyme';

import Button from '..';

const handleRoute = () => {};
const href = 'http://mxstbr.com';
const children = <h1>Test</h1>;
const renderComponent = (props = {}) => mount(
  <Button href={href} {...props}>
    {children}
  </Button>,
);

describe('<Button />', () => {
  test('should render an <a> tag if no route is specified', () => {
    const renderedComponent = renderComponent({ href });
    expect(renderedComponent.find('a')).toHaveLength(1);
  });

  test('should render a <button> tag to change route if the handleRoute prop is specified', () => {
    const renderedComponent = renderComponent({ handleRoute });
    expect(renderedComponent.find('button')).toHaveLength(1);
  });

  test('should have children', () => {
    const renderedComponent = renderComponent();
    expect(renderedComponent.contains(children)).toEqual(true);
  });

  test('should handle click events', () => {
    const onClickSpy = jest.fn();
    const renderedComponent = renderComponent({ onClick: onClickSpy });
    renderedComponent.find('a').simulate('click');
    expect(onClickSpy).toHaveBeenCalled();
  });

  test('should have a className attribute', () => {
    const renderedComponent = renderComponent();
    expect(renderedComponent.find('a').prop('className')).toBeDefined();
  });

  test('should not adopt a type attribute when rendering an <a> tag', () => {
    const type = 'text/html';
    const renderedComponent = renderComponent({ href, type });
    expect(renderedComponent.find('a').prop('type')).toBeUndefined();
  });

  test('should not adopt a type attribute when rendering a button', () => {
    const type = 'submit';
    const renderedComponent = renderComponent({ handleRoute, type });
    expect(renderedComponent.find('button').prop('type')).toBeUndefined();
  });
});

/* global describe, expect, test */
import React from 'react';
import { render } from 'react-testing-library';

import Ul from '../Ul';

describe('<Ul />', () => {
  test('should render an <ul> tag', () => {
    const { container } = render(<Ul />);
    const element = container.firstElementChild;
    expect(element.tagName).toEqual('UL');
  });

  test('should have a class attribute', () => {
    const { container } = render(<Ul />);
    const element = container.firstElementChild;
    expect(element.hasAttribute('class')).toBe(true);
  });

  test('should adopt a valid attribute', () => {
    const id = 'test';
    const { container } = render(<Ul id={id} />);
    const element = container.firstElementChild;
    expect(element.id).toEqual(id);
  });

  test('should not adopt an invalid attribute', () => {
    const { container } = render(<Ul attribute="test" />);
    const element = container.firstElementChild;
    expect(element.hasAttribute('attribute')).toBe(false);
  });
});

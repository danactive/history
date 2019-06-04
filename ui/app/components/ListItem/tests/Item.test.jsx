/* global describe, expect, test */
import React from 'react';
import { render } from 'react-testing-library';

import Item from '../Item';

describe('<Item />', () => {
  test('should render an <div> tag', () => {
    const { container } = render(<Item />);
    expect(container.firstChild.tagName).toEqual('DIV');
  });

  test('should have a class attribute', () => {
    const { container } = render(<Item />);
    expect(container.firstChild.hasAttribute('class')).toBe(true);
  });

  test('should adopt a valid attribute', () => {
    const id = 'test';
    const { container } = render(<Item id={id} />);
    expect(container.firstChild.hasAttribute('id')).toBe(true);
    expect(container.firstChild.id).toEqual(id);
  });

  test('should not adopt an invalid attribute', () => {
    const { container } = render(<Item attribute="test" />);
    expect(container.firstChild.hasAttribute('attribute')).toBe(false);
  });
});

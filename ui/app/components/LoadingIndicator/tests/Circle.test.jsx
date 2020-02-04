/* global describe, expect, test */
import React from 'react';
import { render } from 'react-testing-library';

import Circle from '../Circle';

describe('<Circle />', () => {
  test('should render an <div> tag', () => {
    const { container } = render(<Circle />);
    expect(container.firstChild.tagName).toEqual('DIV');
  });

  test('should have a class attribute', () => {
    const { container } = render(<Circle />);
    expect(container.firstChild.hasAttribute('class')).toBe(true);
  });

  test('should not adopt attributes', () => {
    const id = 'test';
    const { container } = render(<Circle id={id} />);
    expect(container.firstChild.hasAttribute('id')).toBe(false);
  });
});

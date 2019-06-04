/* global describe, expect, test */
import React from 'react';
import { render } from 'react-testing-library';

import A from '../A';

describe('<A />', () => {
  test('should render an <a> tag', () => {
    const { container } = render(<A />);
    expect(container.querySelector('a')).not.toBeNull();
  });

  test('should have a class attribute', () => {
    const { container } = render(<A />);
    expect(container.querySelector('a').hasAttribute('class')).toBe(true);
  });

  test('should adopt a valid attribute', () => {
    const id = 'test';
    const { container } = render(<A id={id} />);
    expect(container.querySelector('a').id).toEqual(id);
  });

  test('should not adopt an invalid attribute', () => {
    const { container } = render(<A attribute="test" />);
    expect(container.querySelector('a[attribute="test"]')).toBeNull();
  });
});

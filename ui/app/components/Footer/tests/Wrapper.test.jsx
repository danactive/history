/* global describe, expect, test */
import React from 'react';
import { render } from 'react-testing-library';

import Wrapper from '../Wrapper';

describe('<Wrapper />', () => {
  test('should render an <footer> tag', () => {
    const { container } = render(<Wrapper />);
    expect(container.querySelector('footer')).not.toBeNull();
  });

  test('should have a class attribute', () => {
    const { container } = render(<Wrapper />);
    expect(container.querySelector('footer').hasAttribute('class')).toBe(true);
  });

  test('should adopt a valid attribute', () => {
    const id = 'test';
    const { container } = render(<Wrapper id={id} />);
    expect(container.querySelector('footer').id).toEqual(id);
  });

  test('should not adopt an invalid attribute', () => {
    const { container } = render(<Wrapper attribute="test" />);
    expect(
      container.querySelector('footer').getAttribute('attribute'),
    ).toBeNull();
  });
});

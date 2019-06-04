/* global describe, expect, mount, test */
import React from 'react';
import { render } from 'react-testing-library';

import Wrapper from '../Wrapper';

describe('<Wrapper />', () => {
  test('should render an <div> tag', () => {
    const { container } = render(<Wrapper />);
    expect(container.querySelector('div')).not.toBeNull();
  });

  test('should have a class attribute', () => {
    const { container } = render(<Wrapper />);
    expect(container.querySelector('div').hasAttribute('class')).toBe(true);
  });

  test('should adopt a valid attribute', () => {
    const id = 'test';
    const { container } = render(<Wrapper id={id} />);
    expect(container.querySelector('div').id).toEqual(id);
  });

  test('should not adopt an invalid attribute', () => {
    const { container } = render(<Wrapper attribute="test" />);
    expect(container.querySelector('div[attribute="test"]')).toBeNull();
  });
});

/* global describe, expect, test */
import React from 'react';
import { render } from 'react-testing-library';

import StyledButton from '../StyledButton';

describe('<StyledButton />', () => {
  test('should render an <button> tag', () => {
    const { container } = render(<StyledButton />);
    expect(container.querySelector('button')).not.toBeNull();
  });

  test('should have a class attribute', () => {
    const { container } = render(<StyledButton />);
    expect(container.querySelector('button').hasAttribute('class')).toBe(true);
  });

  test('should adopt a valid attribute', () => {
    const id = 'test';
    const { container } = render(<StyledButton id={id} />);
    expect(container.querySelector('button').id).toEqual(id);
  });

  test('should not adopt an invalid attribute', () => {
    const { container } = render(<StyledButton attribute="test" />);
    expect(container.querySelector('button[attribute="test"]')).toBeNull();
  });
});

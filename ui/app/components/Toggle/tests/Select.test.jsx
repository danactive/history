/* global describe, expect, test */
import React from 'react';
import { render } from 'react-testing-library';

import Select from '../Select';

describe('<Select />', () => {
  test('should render an <select> tag', () => {
    const { container } = render(<Select />);
    expect(container.firstChild.tagName).toEqual('SELECT');
  });

  test('should have a class attribute', () => {
    const { container } = render(<Select />);
    expect(container.firstChild.hasAttribute('class')).toBe(true);
  });

  test('should adopt a valid attribute', () => {
    const id = 'test';
    const { container } = render(<Select id={id} />);
    expect(container.firstChild.id).toEqual(id);
  });

  test('should not adopt an invalid attribute', () => {
    const { container } = render(<Select attribute="test" />);
    expect(container.firstChild.hasAttribute('attribute')).toBe(false);
  });
});

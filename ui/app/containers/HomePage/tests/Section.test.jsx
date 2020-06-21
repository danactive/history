import React from 'react';
import { render } from '@testing-library/react';

import Section from '../Section';

describe('<Section />', () => {
  test('should render an <section> tag', () => {
    const { container } = render(<Section />);
    expect(container.firstChild.tagName).toEqual('SECTION');
  });

  test('should have a class attribute', () => {
    const { container } = render(<Section />);
    expect(container.firstChild.hasAttribute('class')).toBe(true);
  });

  test('should adopt a valid attribute', () => {
    const id = 'test';
    const { container } = render(<Section id={id} />);
    expect(container.firstChild.id).toEqual(id);
  });

  test('should not adopt an invalid attribute', () => {
    const { container } = render(<Section attribute="test" />);
    expect(container.firstChild.hasAttribute('attribute')).toBe(false);
  });
});

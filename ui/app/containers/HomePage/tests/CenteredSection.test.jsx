/* global describe, expect, test */
import React from 'react';
import { render } from 'react-testing-library';

import CenteredSection from '../CenteredSection';

describe('<CenteredSection />', () => {
  test('should render an <section> tag', () => {
    const {
      container: { firstChild },
    } = render(<CenteredSection />);
    expect(firstChild.tagName).toEqual('SECTION');
  });

  test('should have a class attribute', () => {
    const {
      container: { firstChild },
    } = render(<CenteredSection />);
    expect(firstChild.hasAttribute('class')).toBe(true);
  });

  test('should adopt a valid attribute', () => {
    const id = 'test';
    const {
      container: { firstChild },
    } = render(<CenteredSection id={id} />);
    expect(firstChild.id).toEqual(id);
  });

  test('should not adopt an invalid attribute', () => {
    const {
      container: { firstChild },
    } = render(<CenteredSection attribute="test" />);
    expect(firstChild.hasAttribute('attribute')).toBe(false);
  });
});

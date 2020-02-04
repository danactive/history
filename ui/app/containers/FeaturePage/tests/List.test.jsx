/* global describe, expect, test */
import React from 'react';
import { render } from 'react-testing-library';

import List from '../List';

describe('<List />', () => {
  test('should render an <ul> tag', () => {
    const {
      container: { firstChild },
    } = render(<List />);
    expect(firstChild.tagName).toEqual('UL');
  });

  test('should have a class attribute', () => {
    const {
      container: { firstChild },
    } = render(<List />);
    expect(firstChild.hasAttribute('class')).toBe(true);
  });

  test('should adopt a valid attribute', () => {
    const id = 'test';
    const {
      container: { firstChild },
    } = render(<List id={id} />);
    expect(firstChild.id).toEqual(id);
  });

  test('should not adopt an invalid attribute', () => {
    const {
      container: { firstChild },
    } = render(<List attribute="test" />);
    expect(firstChild.hasAttribute('attribute')).toBe(false);
  });
});

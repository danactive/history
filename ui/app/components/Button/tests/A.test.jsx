import React from 'react';
import { render } from '@testing-library/react';

import A from '../A';

const renderComponent = (props = {}) => {
  const utils = render(<A {...props}>Link</A>);
  const link = utils.queryByText('Link');
  return { ...utils, link };
};

describe('<A />', () => {
  test('should render an <a> tag', () => {
    const { link } = renderComponent();
    expect(link).toBeInTheDocument();
    expect(link.tagName).toBe('A');
  });

  test('should have a class attribute', () => {
    const { link } = renderComponent();
    expect(link).toHaveAttribute('class');
  });

  test('should adopt a valid attribute', () => {
    const id = 'test';
    const { link } = renderComponent({ id });
    expect(link).toHaveAttribute('id', id);
  });

  test('should not adopt an invalid attribute', () => {
    const { link } = renderComponent({ attribute: 'test' });
    expect(link).not.toHaveAttribute('attribute');
  });
});

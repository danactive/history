import React from 'react';
import { render } from '@testing-library/react';

import StyledButton from '../StyledButton';

const renderComponent = (props = {}) => {
  const utils = render(<StyledButton {...props}>Button</StyledButton>);
  const button = utils.queryByText('Button');
  return { ...utils, button };
};

describe('<StyledButton />', () => {
  test('should render a <button> tag', () => {
    const { button } = renderComponent();
    expect(button).toBeInTheDocument();
    expect(button.tagName).toBe('BUTTON');
  });

  test('should have a class attribute', () => {
    const { button } = renderComponent();
    expect(button).toHaveAttribute('class');
  });

  test('should adopt a valid attribute', () => {
    const id = 'test';
    const { button } = renderComponent({ id });
    expect(button).toHaveAttribute('id', id);
  });

  test('should not adopt an invalid attribute', () => {
    const { button } = renderComponent({ attribute: 'test' });
    expect(button).not.toHaveAttribute('attribute');
  });
});

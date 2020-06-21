import React from 'react';
import { render } from '@testing-library/react';

import Wrapper from '../Wrapper';

const renderComponent = (props = {}) => {
  const utils = render(<Wrapper {...props}>Wrapper</Wrapper>);
  const wrapper = utils.queryByText('Wrapper');
  return { ...utils, wrapper };
};

describe('<Wrapper />', () => {
  test('should render a <footer> tag', () => {
    const { wrapper } = renderComponent();
    expect(wrapper).toBeInTheDocument();
    expect(wrapper.tagName).toBe('FOOTER');
  });

  test('should have a class attribute', () => {
    const { wrapper } = renderComponent();
    expect(wrapper).toHaveAttribute('class');
  });

  test('should adopt a valid attribute', () => {
    const id = 'test';
    const { wrapper } = renderComponent({ id });
    expect(wrapper).toHaveAttribute('id', id);
  });

  test('should not adopt an invalid attribute', () => {
    const { wrapper } = renderComponent({ attribute: 'test' });
    expect(wrapper).not.toHaveAttribute('attribute');
  });
});

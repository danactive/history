/* global describe, expect, test */
import React from 'react';
import { render } from 'react-testing-library';

import H2 from '../index';

describe('<H2 />', () => {
  test('should render a prop', () => {
    const id = 'testId';
    const { container } = render(<H2 id={id} />);
    expect(container.querySelector('h2').id).toEqual(id);
  });

  test('should render its text', () => {
    const children = 'Text';
    const { container, queryByText } = render(<H2>{children}</H2>);
    const { childNodes } = container.querySelector('h2');
    expect(childNodes).toHaveLength(1);
    expect(queryByText(children)).not.toBeNull();
  });
});

import React from 'react';
import { render } from '@testing-library/react';

import PhotoHeader from '..';

describe('<PhotoHeader />', () => {
  test('should show nothing when no current memory', () => {
    const { container } = render(<PhotoHeader />);
    const received = container.querySelector('div');
    expect(received).toBeNull();
  });

  test('should show nothing when no current memory', () => {
    const { container } = render(<PhotoHeader currentMemory={null} />);
    const received = container.querySelector('div');
    expect(received).toBeNull();
  });

  test('should have a city', () => {
    expect.assertions(2);

    const city = 'Vancouver';
    const { container, getByText } = render(
      <PhotoHeader currentMemory={{ city }} />,
    );
    const received = getByText(new RegExp(city));

    expect(received).not.toBeNull();

    const elements = container.querySelectorAll('h1');
    expect(elements).toHaveLength(1);
  });
});

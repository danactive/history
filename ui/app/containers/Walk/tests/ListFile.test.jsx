/* global describe, expect, test */
import React from 'react';
import { render } from 'react-testing-library';

import ListFile from '../ListFile';

describe('<ListFile />', () => {
  test('should render a folder', () => {
    const path = 'testPath';
    const { container } = render(<ListFile item={{ mediumType: 'folder', path }} />);
    expect(container.querySelector('a').href).toEqual(`http://localhost/?path=${path}`);
  });
});

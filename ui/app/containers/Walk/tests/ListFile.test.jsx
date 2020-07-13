import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { render } from '@testing-library/react';

import ListFile from '../ListFile';

describe('<ListFile />', () => {
  test('should render a folder', () => {
    const path = 'testPath';
    const { container } = render(
      <BrowserRouter>
        <ListFile item={{ mediumType: 'folder', path }} />
      </BrowserRouter>,
    );
    expect(container.querySelector('a').href).toEqual(
      `http://localhost/#path=${path}`,
    );
  });
});

/* eslint-disable jsx-a11y/anchor-is-valid */
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { render } from '@testing-library/react';

import Link from '../index';

describe('<Link />', () => {
  test('Expect to not log errors in console', () => {
    const spy = jest.spyOn(global.console, 'error');
    render(
      <BrowserRouter>
        <Link to="some-internal-link" />
      </BrowserRouter>,
    );
    expect(spy).not.toHaveBeenCalled();
  });

  test('Should render and match the snapshot', () => {
    const {
      container: { firstChild },
    } = render(
      <BrowserRouter>
        <Link />
      </BrowserRouter>,
    );
    expect(firstChild).toMatchSnapshot();
  });
});

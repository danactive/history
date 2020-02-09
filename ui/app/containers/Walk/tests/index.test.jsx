/* global describe, expect, jest, test */

import React from 'react';
import { render } from 'react-testing-library';
// import 'jest-dom/extend-expect'; // add some helpful assertions

import Walk from '../index';

describe('<Walk />', () => {
  test('Expect to not log errors in console', () => {
    const spy = jest.spyOn(global.console, 'error');
    const dispatch = jest.fn();
    render(<Walk dispatch={dispatch} />);
    expect(spy).not.toHaveBeenCalled();
  });

  test('Expect to have additional unit tests specified', () => {
    expect(true).toEqual(false);
  });

  /**
   * Unskip this test to use it
   *
   * @see {@link https://jestjs.io/docs/en/api#testskipname-fn}
   */
  test.skip('Should render and match the snapshot', () => {
    const {
      container: { firstChild },
    } = render(<Walk />);
    expect(firstChild).toMatchSnapshot();
  });
});

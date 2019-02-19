/* global describe, expect, test */
import React from 'react';
import renderer from 'react-test-renderer';
import 'jest-styled-components';

import LoadingIndicator from '..';

describe('<LoadingIndicator />', () => {
  test('should match the snapshot', () => {
    const renderedComponent = renderer.create(<LoadingIndicator />).toJSON();
    expect(renderedComponent).toMatchSnapshot();
  });
});

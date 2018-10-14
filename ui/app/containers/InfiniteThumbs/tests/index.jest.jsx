/* global describe, expect, it, shallow */
import React from 'react';

import InfiniteThumbs from '../index';

describe('<InfiniteThumbs />', () => {
  const defaultProps = {};

  // const mountComponent = ({ props = {} } = {}) => {
  //   const combinedProps = Object.assign({}, defaultProps, props);
  //   return mount(<InfiniteThumbs {...combinedProps} />);
  // };

  const shallowComponent = ({ props = {} } = {}) => {
    const combinedProps = Object.assign({}, defaultProps, props);
    return shallow(<InfiniteThumbs {...combinedProps} />);
  };

  it('should display album error', () => {
    const renderedComponent = shallowComponent({ props: { error: true } });
    const actual = renderedComponent.contains(
      <div />,
    );

    expect(actual).toEqual(true);
  });
});

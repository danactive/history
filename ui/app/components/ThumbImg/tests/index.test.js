import React from 'react';
import { mount, shallow } from 'enzyme';

import ThumbImg from '../index';

describe('Component - <ThumbImg />', () => {
  const expectedValues = {
    alt: 'Preview thumbnail image (scaled down dimensions)',
    src: 'test.png',
  };
  const shallowComponent = (props = {}) => shallow(<ThumbImg src={expectedValues.src} {...props} />);
  const mountComponent = (props = {}) => mount(<ThumbImg src={expectedValues.src} {...props} />);

  it('should render an <ThumbImg__Img> component', () => {
    const received = mountComponent().exists('ThumbImg__Img');
    const expected = true;
    expect(received).toEqual(expected);
  });

  it('should match src attribute value', () => {
    const received = mountComponent().find('img').prop('src');
    const expected = expectedValues.src;
    expect(received).toEqual(expected);
  });

  it('should have an alt attribute value', () => {
    const received = mountComponent().find('img').prop('alt');
    expect(received).toEqual(expectedValues.alt);
  });

  it('should not have a className attribute value', () => {
    const received = shallowComponent().prop('className');
    const expected = undefined;
    expect(received).toEqual(expected);
  });

  it('should not adopt a className attribute', () => {
    const className = 'test';
    const received = shallowComponent({ className }).hasClass(className);
    const expected = false;
    expect(received).toEqual(expected);
  });

  it('should not adopt a srcset attribute', () => {
    const received = shallowComponent({ srcset: 'test-HD.png 2x' }).prop('srcset');
    const expected = undefined;
    expect(received).toEqual(expected);
  });
});

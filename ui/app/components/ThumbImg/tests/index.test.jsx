/* global describe, expect, mount, shallow, test */
import React from 'react';

import ThumbImg from '..';

describe('Component - <ThumbImg />', () => {
  const expectedValues = {
    alt: 'Preview thumbnail image (scaled down dimensions)',
    src: 'test.png',
  };
  const shallowComponent = (props = {}) => shallow(<ThumbImg src={expectedValues.src} {...props} />);
  const mountComponent = (props = {}) => mount(<ThumbImg src={expectedValues.src} {...props} />);

  test('should render an <ThumbImg__Img> component', () => {
    const received = mountComponent().exists('ThumbImg__Img');
    const expected = true;
    expect(received).toEqual(expected);
  });

  test('should match src attribute value', () => {
    const received = mountComponent().find('img').prop('src');
    const expected = expectedValues.src;
    expect(received).toEqual(expected);
  });

  test('should have an alt attribute value', () => {
    const received = mountComponent().find('img').prop('alt');
    expect(received).toEqual(expectedValues.alt);
  });

  test('should not have a className attribute value', () => {
    const received = shallowComponent().prop('className');
    const expected = undefined;
    expect(received).toEqual(expected);
  });

  test('should not adopt a className attribute', () => {
    const className = 'test';
    const received = shallowComponent({ className }).hasClass(className);
    const expected = false;
    expect(received).toEqual(expected);
  });

  test('should not adopt a srcset attribute', () => {
    const received = shallowComponent({ srcset: 'test-HD.png 2x' }).prop('srcset');
    const expected = undefined;
    expect(received).toEqual(expected);
  });
});

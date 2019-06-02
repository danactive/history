/* global describe, expect, shallow, test */
import React from 'react';

import Img from '../index';

describe('Component - <ThumbImg />', () => {
  const src = 'test.png';
  const alt = 'test';
  const renderComponent = (props = {}) => shallow(<Img src={src} alt={alt} {...props} />);

  test('should render an <Styled(Img)> component', () => {
    const actual = renderComponent().is('Styled(Img)');
    const expected = true;
    expect(actual).toEqual(expected);
  });

  test('should match src attribute value', () => {
    const actual = renderComponent().prop('src');
    const expected = src;
    expect(actual).toEqual(expected);
  });

  test('should have an alt attribute value', () => {
    const actual = renderComponent().prop('alt');
    expect(actual).toBeTruthy();
  });

  test('should not have a className attribute value', () => {
    const actual = renderComponent().prop('className');
    const expected = undefined;
    expect(actual).toEqual(expected);
  });

  test('should not adopt a className attribute', () => {
    const className = 'test';
    const actual = renderComponent({ className }).hasClass(className);
    const expected = false;
    expect(actual).toEqual(expected);
  });

  test('should not adopt a srcset attribute', () => {
    const actual = renderComponent({ srcset: 'test-HD.png 2x' }).prop('srcset');
    const expected = undefined;
    expect(actual).toEqual(expected);
  });
});

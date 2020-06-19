import React from 'react';

import Img from '../index';

describe('Component - <Img />', () => {
  const src = 'test.png';
  const alt = 'test';
  const renderComponent = ({ className, srcset } = {}) => shallow(<Img src={src} alt={alt} className={className} srcset={srcset} />);

  test('should render an <img> tag', () => {
    const actual = renderComponent().is('img');
    const expected = true;
    expect(actual).toEqual(expected);
  });

  test('should match src attribute value', () => {
    const actual = renderComponent().prop('src');
    const expected = src;
    expect(actual).toEqual(expected);
  });

  test('should match alt attribute value', () => {
    const actual = renderComponent().prop('alt');
    const expected = alt;
    expect(actual).toEqual(expected);
  });

  test('should not have a className attribute', () => {
    const actual = renderComponent().prop('className');
    const expected = undefined;
    expect(actual).toEqual(expected);
  });

  test('should adopt a className attribute', () => {
    const className = 'test';
    const actual = renderComponent({ className }).hasClass(className);
    const expected = true;
    expect(actual).toEqual(expected);
  });

  test('should not adopt a srcset attribute', () => {
    const actual = renderComponent({ srcset: 'test-HD.png 2x' }).prop('srcset');
    const expected = undefined;
    expect(actual).toEqual(expected);
  });
});

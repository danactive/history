import React from 'react';
import { shallow } from 'enzyme';

import ThumbImg from '../index';

describe('Component - <ThumbImg />', () => {
  const src = 'test.png';
  const alt = 'test';
  const renderComponent = (props = {}) => shallow(<ThumbImg src={src} alt={alt} {...props} />);

  it('should render an <ThumbImg__Img> component', () => {
    const received = renderComponent().is('ThumbImg__Img');
    const expected = true;
    expect(received).toEqual(expected);
  });

  it('should match src attribute value', () => {
    const received = renderComponent().prop('src');
    const expected = src;
    expect(received).toEqual(expected);
  });

  it('should have an alt attribute value', () => {
    const received = renderComponent().prop('alt');
    expect(received).toBeDefined();
  });

  it('should not have a className attribute value', () => {
    const received = renderComponent().prop('className');
    const expected = undefined;
    expect(received).toEqual(expected);
  });

  it('should not adopt a className attribute', () => {
    const className = 'test';
    const received = renderComponent({ className }).hasClass(className);
    const expected = false;
    expect(received).toEqual(expected);
  });

  it('should not adopt a srcset attribute', () => {
    const received = renderComponent({ srcset: 'test-HD.png 2x' }).prop('srcset');
    const expected = undefined;
    expect(received).toEqual(expected);
  });
});

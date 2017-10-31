import { configure, shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import React from 'react';
import test from 'tape';

import Img from '../index';

test('Component - <Img />', (describe) => {
  configure({ adapter: new Adapter() });

  const src = 'test.png';
  const alt = 'test';
  const renderComponent = (props = {}) => shallow(<Img src={src} alt={alt} {...props} />);

  describe.test('should render an <img> tag', (assert) => {
    const actual = renderComponent().is('img');
    const expected = true;
    assert.equal(actual, expected);
    assert.end();
  });

  describe.test('should have an src attribute', (assert) => {
    const actual = renderComponent().prop('src');
    const expected = src;
    assert.equal(actual, expected);
    assert.end();
  });

  describe.test('should have an alt attribute', (assert) => {
    const actual = renderComponent().prop('alt');
    const expected = alt;
    assert.equal(actual, expected);
    assert.end();
  });

  describe.test('should not have a className attribute', (assert) => {
    const actual = renderComponent().prop('className');
    const expected = null;
    assert.equal(actual, expected);
    assert.end();
  });

  describe.test('should adopt a className attribute', (assert) => {
    const className = 'test';
    const actual = renderComponent({ className }).hasClass(className);
    const expected = true;
    assert.equal(actual, expected);
    assert.end();
  });

  describe.test('should not adopt a srcset attribute', (assert) => {
    const actual = renderComponent({ srcset: 'test-HD.png 2x' }).prop('srcset');
    const expected = undefined;
    assert.equal(actual, expected);
    assert.end();
  });
});

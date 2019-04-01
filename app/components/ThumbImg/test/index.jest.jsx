import { configure, shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import React from 'react';
import test from 'tape';

import Img from '../index';

test('Component - <ThumbImg />', (describe) => {
  configure({ adapter: new Adapter() });

  const src = 'test.png';
  const alt = 'test';
  const renderComponent = (props = {}) => shallow(<Img src={src} alt={alt} {...props} />);

  describe.test('should render an <Styled(Img)> component', (assert) => {
    const actual = renderComponent().is('Styled(Img)');
    const expected = true;
    assert.equal(actual, expected);
    assert.end();
  });

  describe.test('should match src attribute value', (assert) => {
    const actual = renderComponent().prop('src');
    const expected = src;
    assert.equal(actual, expected);
    assert.end();
  });

  describe.test('should have an alt attribute value', (assert) => {
    const actual = renderComponent().prop('alt');
    assert.ok(actual);
    assert.end();
  });

  describe.test('should not have a className attribute value', (assert) => {
    const actual = renderComponent().prop('className');
    const expected = undefined;
    assert.equal(actual, expected);
    assert.end();
  });

  describe.test('should not adopt a className attribute', (assert) => {
    const className = 'test';
    const actual = renderComponent({ className }).hasClass(className);
    const expected = false;
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

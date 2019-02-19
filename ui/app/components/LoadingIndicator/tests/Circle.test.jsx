/* global describe, expect, test */
import React from 'react';
import { mount } from 'enzyme';

import Circle from '../Circle';

describe('<Circle />', () => {
  test('should render an <div> tag', () => {
    const renderedComponent = mount(<Circle />);
    expect(renderedComponent.find('div')).toHaveLength(1);
  });

  test('should have a className attribute', () => {
    const renderedComponent = mount(<Circle />);
    expect(renderedComponent.find('div').prop('className')).toBeDefined();
  });

  test('should not adopt attributes', () => {
    const id = 'test';
    const renderedComponent = mount(<Circle id={id} />);
    expect(renderedComponent.find('div').prop('id')).toBeUndefined();
  });
});

/* global describe, expect, test */
import React from 'react';
import { shallow } from 'enzyme';

import H3 from '..';

describe('<H3 />', () => {
  test('should render a prop', () => {
    const id = 'testId';
    const renderedComponent = shallow(<H3 id={id} />);
    expect(renderedComponent.prop('id')).toEqual(id);
  });

  test('should render its text', () => {
    const children = 'Text';
    const renderedComponent = shallow(<H3>{children}</H3>);
    expect(renderedComponent.contains(children)).toBe(true);
  });
});

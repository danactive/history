/* global describe, expect, mount, test */
import React from 'react';

import ListItem from '..';

describe('<ListItem />', () => {
  test('should have a className', () => {
    const renderedComponent = mount(<ListItem className="test" />);
    expect(renderedComponent.find('li').prop('className')).toBeDefined();
  });

  test('should render the content passed to it', () => {
    const content = <div>Hello world!</div>;
    const renderedComponent = mount(<ListItem item={content} />);
    expect(renderedComponent.contains(content)).toBe(true);
  });
});

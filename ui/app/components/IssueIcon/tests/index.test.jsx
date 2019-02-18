/* global describe, expect, test */
import React from 'react';
import { shallow } from 'enzyme';

import IssueIcon from '..';

describe('<IssueIcon />', () => {
  test('should render a SVG', () => {
    const renderedComponent = shallow(<IssueIcon />);
    expect(renderedComponent.find('svg')).toHaveLength(1);
  });
});

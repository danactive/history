/* global describe, expect, test */
import React from 'react';
import { shallow } from 'enzyme';

import ListItem from '../../ListItem';
import List from '..';

describe('<List />', () => {
  test('should render the component if no items are passed', () => {
    const renderedComponent = shallow(<List component={ListItem} />);
    expect(renderedComponent.find(ListItem)).toBeDefined();
  });

  test('should pass all items props to rendered component', () => {
    const items = [{ id: 1, name: 'Hello' }, { id: 2, name: 'World' }];

    const component = ({ item }) => <ListItem>{item.name}</ListItem>;

    const renderedComponent = shallow(
      <List items={items} component={component} />,
    );
    expect(renderedComponent.find(component)).toHaveLength(2);
    expect(
      renderedComponent
        .find(component)
        .at(0)
        .prop('item'),
    ).toBe(items[0]);
    expect(
      renderedComponent
        .find(component)
        .at(1)
        .prop('item'),
    ).toBe(items[1]);
  });
});

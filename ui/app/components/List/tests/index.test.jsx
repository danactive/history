/* global describe, expect, test */
import React from 'react';
import { render } from 'react-testing-library';

import List from '..';

describe('<List />', () => {
  test('should render the passed component if no items are passed', () => {
    const component = () => <li id="expected id">test</li>;
    const { container } = render(<List component={component} />);
    expect(container.querySelector('li')).not.toBeNull();
    expect(container.querySelector('li').id).toEqual('expected id');
  });

  test('should pass all items props to rendered component', () => {
    const items = [{ id: 1, name: 'Hello' }, { id: 2, name: 'World' }];

    const component = ({ item }) => <li>{item.name}</li>;

    const { container, getByText } = render(
      <List items={items} component={component} />,
    );
    const elements = container.querySelectorAll('li');
    expect(elements).toHaveLength(2);
    expect(getByText(items[0].name)).not.toBeNull();
    expect(getByText(items[1].name)).not.toBeNull();
  });
});

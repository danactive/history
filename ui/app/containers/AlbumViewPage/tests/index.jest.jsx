/* global beforeEach, describe, expect, jest, it, mount, shallow */
import React from 'react';
import { memoryHistory } from 'react-router-dom';

import AlbumViewPage from '../index';
import configureStore from '../../../configureStore';

describe('<AlbumViewPage />', () => {
  let store;

  global.document = {
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  };

  const defaultProps = {
    match: {
      params: {},
    },
    location: {
      search: {},
    },
  };

  const mountComponent = ({ props = {} } = {}) => {
    const combinedProps = Object.assign({}, defaultProps, props);
    return mount(<AlbumViewPage {...combinedProps} />, { context: { store } });
  };

  const shallowComponent = ({ props = {} } = {}) => {
    const combinedProps = Object.assign({}, defaultProps, props);
    return shallow(<AlbumViewPage {...combinedProps} />, { context: { store } });
  };

  beforeEach(() => {
    store = configureStore({}, memoryHistory);
  });

  it('should never re-render the component', () => {
    const renderedComponent = mountComponent();
    const instance = renderedComponent.instance();
    expect(instance.componentWillMount()).toBe(false);
  });

  it('should render an <AlbumViewPage /> component', () => {
    expect.hasAssertions();

    jest.spyOn(AlbumViewPage.prototype, 'componentDidMount');
    shallowComponent();
    expect(AlbumViewPage.prototype.componentDidMount.mock.calls.length).toBe(1);

    // const spy = jest.spyOn(AlbumViewPage.prototype, 'componentDidMount');
    // const wrapper = mountComponent()
    // expect(spy).toHaveBeenCalledTimes(1);
  });
});

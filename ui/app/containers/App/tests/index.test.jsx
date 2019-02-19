/* global describe, expect, shallow, test */
import React from 'react';
import { Route } from 'react-router-dom';

import Header from '../../../components/Header';
import Footer from '../../../components/Footer';
import App from '../index';

describe('<App />', () => {
  test('should render the header', () => {
    const renderedComponent = shallow(<App />);
    expect(renderedComponent.find(Header)).toHaveLength(1);
  });

  test('should render some routes', () => {
    const renderedComponent = shallow(<App />);
    expect(renderedComponent.find(Route)).not.toHaveLength(0);
  });

  test('should render the footer', () => {
    const renderedComponent = shallow(<App />);
    expect(renderedComponent.find(Footer)).toHaveLength(1);
  });
});

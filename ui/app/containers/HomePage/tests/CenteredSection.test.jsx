/* global describe, expect, mount, test */
import React from 'react';
import { enzymeFind } from 'styled-components/test-utils';

import CenteredSection from '../CenteredSection';

describe('<CenteredSection />', () => {
  test('should render a <section> tag', () => {
    const wrapper = mount(<CenteredSection />);
    const renderedComponent = enzymeFind(wrapper, CenteredSection);
    expect(renderedComponent.type()).toEqual('section');
  });

  test('should have a className attribute', () => {
    const wrapper = mount(<CenteredSection />);
    const renderedComponent = enzymeFind(wrapper, CenteredSection);
    expect(renderedComponent.prop('className')).toBeDefined();
  });

  test('should adopt a valid attribute', () => {
    const id = 'testId';
    const wrapper = mount(<CenteredSection id={id} />);
    const renderedComponent = enzymeFind(wrapper, CenteredSection);
    expect(renderedComponent.prop('id')).toEqual(id);
  });

  test('should not adopt an invalid attribute', () => {
    const wrapper = mount(<CenteredSection attribute="test" />);
    const renderedComponent = enzymeFind(wrapper, CenteredSection);
    expect(renderedComponent.prop('attribute')).toBeUndefined();
  });
});

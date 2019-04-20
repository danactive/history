/* global describe, expect, mount, test */
import React from 'react';

import Gallery from '../components/gallery';

describe('Gallery - Page (React Component)', () => {
  test('* Parent element', () => {
    const wrapper = mount(<Gallery gallery="demo" />);
    const aProps = wrapper.find('a').props();

    const actual = aProps.href;
    const expected = 'static/gallery-demo/xml/gallery.xml';
    expect(actual).toEqual(expected);
  });
});

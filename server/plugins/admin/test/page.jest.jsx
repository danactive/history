/* global describe, expect, shallow, test */
import React from 'react';

import Page from '../components/page';

describe('View Admin - Page (React Component)', () => {
  test('* Page loads', () => {
    const wrapper = shallow(<Page />);

    expect(wrapper.contains(
      <a href="/edit/album">
        Edit Album
      </a>,
    )).toBeTruthy();
  });
});

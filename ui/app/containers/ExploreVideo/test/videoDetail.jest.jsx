/* global describe, expect, shallow, test */

import React from 'react';

import mock from './fixtures/youtube.json';
import VideoDetail from '../VideoDetail';

describe('Explore Video - Video Detail (React Component)', () => {
  test('* Render component with missing video object', () => {
    const actual = shallow(<VideoDetail />).html();
    const expected = '<section>Loading...</section>';
    expect(actual).toEqual(expected);
  });

  test('* Render iframe element', () => {
    const wrapper = shallow(<VideoDetail video={mock.items[0]} />);
    const props = wrapper.find('iframe').props();
    const {
      src,
    } = props;

    const actual = src;
    const expected = 'https://www.youtube.com/embed/92ISlO9U-84';
    expect(actual).toEqual(expected);
  });

  test('* Render video text elements', () => {
    const wrapper = shallow(<VideoDetail video={mock.items[0]} />);
    const videoTitle = wrapper.find('#video-text');
    let actual;
    let expected;


    actual = videoTitle.find('#video-title').props().children;
    expected = mock.items[0].snippet.title;
    expect(actual).toEqual(expected);


    actual = videoTitle.find('#video-description').props().children;
    expected = mock.items[0].snippet.description;
    expect(actual).toEqual(expected);
  });
});

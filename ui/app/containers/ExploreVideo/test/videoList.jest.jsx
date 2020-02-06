/* global describe, expect, shallow, test */

import React from 'react';

import mock from './fixtures/youtube.json';
import VideoList from '../VideoList';
import VideoListItem from '../VideoListItem';

describe('Explore Video - VideoList (React Components)', () => {
  test('* Render component', () => {
    const wrapper = shallow(<VideoList index="1" onVideoSelect={() => {}} videos={mock.items} />);


    const actual = wrapper.find('VideoListItem').length;
    const expected = mock.items.length;
    expect(actual).toEqual(expected);
  });
});

describe('Explore Video - VideoListItem (React Components)', () => {
  test('* Render video text elements', () => {
    const wrapper = shallow(<VideoListItem index={1} onVideoSelect={() => {}} video={mock.items[0]} />);
    let actual;
    let expected;


    actual = wrapper.find('.media-heading').props().children;
    expected = mock.items[0].snippet.title;
    expect(actual).toEqual(expected);


    actual = wrapper.find('.media-thumbnail').children().props().src;
    expected = mock.items[0].snippet.thumbnails.default.url;
    expect(actual).toEqual(expected);
  });
});

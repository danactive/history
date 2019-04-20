/* global beforeEach, describe, expect, mount, shallow, test */

import React from 'react';

import Thumb from '../components/thumb';

describe('View Album - Thumb (React Component)', () => {
  let item = {};

  beforeEach(() => {
    item = {
      mediaPath: 'c',
      thumbCaption: 'a',
      thumbPath: 'b',
    };
  });

  test('* Thumbnail image and caption', () => {
    const wrapper = shallow(<Thumb item={item} />);

    expect(wrapper.contains(
      <img src={item.thumbPath} alt={item.thumbCaption} title={item.caption} />,
    )).toBeTruthy();

    expect(wrapper.contains(
      <div className="albumBoxPhotoCaption">
        {item.thumbCaption}
      </div>,
    )).toBeTruthy();
  });

  test('* Thumbnail missing geocode', () => {
    const wrapper = mount(<Thumb item={item} />);
    const liProps = wrapper.find('li').props();

    expect(liProps['data-lon']).toBeFalsy();
    expect(liProps['data-lat']).toBeFalsy();
  });

  test('* Thumbnail has geocode', () => {
    item.geo = {
      lat: 1,
      lon: 0,
    };

    const wrapper = mount(<Thumb item={item} />);
    const liProps = wrapper.find('li').props();
    expect(liProps['data-lon']).toEqual(0);
    expect(liProps['data-lat']).toEqual(1);
  });

  test('* Title - Photo City', () => {
    item.photoCity = 'Vancouver, BC';
    const wrapper = mount(<Thumb item={item} />);
    const { title } = wrapper.find('a').props();

    expect(title).toEqual(item.photoCity);
  });

  test('* Reference - Wikipedia', () => {
    item.ref = {
      name: 'Vancouver_International_Airport',
      source: 'wikipedia',
    };

    const wrapper = mount(<Thumb item={item} />);
    const { title } = wrapper.find('a').props();
    const titleHtml = '<a href=\'https://en.wikipedia.org/wiki/Vancouver_International_Airport\' target=\'_blank\'>Wiki</a>';

    expect(title).toEqual(titleHtml);
  });

  test('* Reference - YouTube', () => {
    item.ref = {
      name: 'YeeCunkIaco',
      source: 'youtube',
    };

    const wrapper = mount(<Thumb item={item} />);
    const { title } = wrapper.find('a').props();
    const titleHtml = '<a href=\'https://www.youtube.com/watch?v=YeeCunkIaco\' target=\'_blank\'>YouTube</a>';

    expect(title).toEqual(titleHtml);
  });
});

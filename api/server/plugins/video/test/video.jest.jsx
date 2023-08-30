/* global describe, expect, mount, test */

import React from 'react';

import Video from '../components/video';

describe('Video - Video (React Component)', () => {
  const item = {
    w: 800,
    h: 600,
    gallery: 'test',
    sources: '2012-fireplace.mp4,2012-fireplace.webm',
  };

  test('* Parent element', () => {
    const wrapper = mount(<Video video={item} />);
    const liProps = wrapper.find('video').props();

    expect(liProps.width).toEqual(800);
    expect(liProps.height).toEqual(600);
    expect(liProps.poster).toEqual('/galleries/test/media/photos/2012/2012-fireplace.jpg');
    expect(liProps.controls).toEqual(true);
    expect(liProps.preload).toEqual('auto');
    expect(liProps.autoPlay).toEqual(false);
  });

  test('* Source element', () => {
    const wrapper = mount(<Video video={item} />);
    const sources = wrapper.find('source');
    expect(sources.length).toEqual(2);
    expect(sources.find('source').first().props().type.includes('video/mp4')).toBeTruthy();
  });
});

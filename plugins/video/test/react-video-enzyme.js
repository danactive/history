import test from 'tape';
import React from 'react';
import { mount } from 'enzyme';

import '../../../test/react-enzyme-setup';
import Video from '../views/video';

test('React Component - Video', { skip: false }, (describe) => {
  const item = {
    w: 800,
    h: 600,
    gallery: 'test',
    sources: '2017-video.mp4',
  };

  describe.test('* Parent element', (assert) => {
    const wrapper = mount(<Video video={item} />);
    const liProps = wrapper.find('video').props();
    assert.equal(liProps.width, 800, 'Width');
    assert.equal(liProps.height, 600, 'Height');
    assert.equal(liProps.poster, '/static/gallery-test/media/photos/2017/2017-video.jpg', 'Poster');
    assert.equal(liProps.controls, true, 'Controls');
    assert.equal(liProps.preload, 'auto', 'Preload');
    assert.equal(liProps.autoPlay, 'true', 'Autoplay');
    assert.end();
  });
});

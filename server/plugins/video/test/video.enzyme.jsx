import Adapter from 'enzyme-adapter-react-16';
import enzyme from 'enzyme';
import React from 'react';
import test from 'tape';

import '../../../../server/test/setup.enzyme';
import Video from '../components/video';

test('Video - Video (React Component)', { skip: false }, (describe) => {
  const { mount } = enzyme;

  enzyme.configure({ adapter: new Adapter() });

  const item = {
    w: 800,
    h: 600,
    gallery: 'test',
    sources: '2017-video.mp4'
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

import Adapter from 'enzyme-adapter-react-16';
import enzyme from 'enzyme';
import React from 'react';
import test from 'tape';

import '../../../test/setup.enzyme';
import Video from '../components/video';

test('Video - Video (React Component)', { skip: false }, (describe) => {
  const { mount } = enzyme;

  enzyme.configure({ adapter: new Adapter() });

  const item = {
    w: 800,
    h: 600,
    gallery: 'test',
    sources: '2012-fireplace.mp4,2012-fireplace.webm',
  };

  describe.test('* Parent element', (assert) => {
    const wrapper = mount(<Video video={item} />);
    const liProps = wrapper.find('video').props();
    assert.equal(liProps.width, 800, 'Width');
    assert.equal(liProps.height, 600, 'Height');
    assert.equal(liProps.poster, '/static/gallery-test/media/photos/2012/2012-fireplace.jpg', 'Poster');
    assert.equal(liProps.controls, true, 'Controls');
    assert.equal(liProps.preload, 'auto', 'Preload');
    assert.equal(liProps.autoPlay, 'true', 'Autoplay');
    assert.end();
  });

  describe.test('* Source element', (assert) => {
    const wrapper = mount(<Video video={item} />);
    const sources = wrapper.find('source');
    assert.equal(sources.length, 2, 'Count');
    assert.ok(sources.find('source').first().props().type.includes('video/mp4'), 'Source codec match');
    assert.end();
  });
});

import Adapter from 'enzyme-adapter-react-16';
import enzyme from 'enzyme';
import React from 'react';
import test from 'tape';

import '../../../test/setup.enzyme';
import mock from './fixtures/youtube.json';
import VideoList from '../components/videoList';
import VideoListItem from '../components/videoListItem';

const { shallow } = enzyme;

enzyme.configure({ adapter: new Adapter() });

test('Explore Video - VideoList (React Components)', (describe) => {
  describe.test('* Render component', (assert) => {
    const wrapper = shallow(<VideoList onVideoSelect={() => {}} videos={mock.items} />);


    const actual = wrapper.find('VideoListItem').length;
    const expected = mock.items.length;
    assert.equal(actual, expected, 'Thumbnail count');


    assert.end();
  });
});

test('Explore Video - VideoListItem (React Components)', (describe) => {
  describe.test('* Render video text elements', (assert) => {
    const wrapper = shallow(<VideoListItem onVideoSelect={() => {}} video={mock.items[0]} />);
    let actual;
    let expected;


    actual = wrapper.find('.media-heading').props().children;
    expected = mock.items[0].snippet.title;
    assert.equal(actual, expected, 'Video title');


    actual = wrapper.find('.media-thumbnail').children().props().src;
    expected = mock.items[0].snippet.thumbnails.default.url;
    assert.equal(actual, expected, 'Video thumbnail');


    assert.end();
  });
});

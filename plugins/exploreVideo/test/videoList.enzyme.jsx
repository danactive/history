const { shallow } = require('enzyme');
const React = require('react');
const test = require('tape');

require('../../../test/setup.enzyme');
const mock = require('../test/mocks/youtube.json');
const VideoList = require('../components/videoList.jsx');
const VideoListItem = require('../components/videoListItem.jsx');

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

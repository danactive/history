const { shallow } = require('enzyme');
const React = require('react');
const test = require('tape');

require('../../../test/setup.enzyme');
const VideoDetail = require('../components/videoDetail');
const mock = require('../test/mocks/youtube.json');

test('Explore Video - Video Detail (React Component)', (describe) => {
  describe.test('* Render component with missing video object', (assert) => {
    const actual = shallow(<VideoDetail />).html();
    const expected = '<section>Loading...</section>';
    assert.equal(actual, expected, 'Missing video');

    assert.end();
  });

  describe.test('* Render iframe element', (assert) => {
    const wrapper = shallow(<VideoDetail video={mock.items[0]} />);
    const props = wrapper.find('iframe').props();


    const actual = props.src;
    const expected = 'https://www.youtube.com/embed/92ISlO9U-84';
    assert.equal(actual, expected, 'YouTube address');


    assert.end();
  });

  describe.test('* Render video text elements', (assert) => {
    const wrapper = shallow(<VideoDetail video={mock.items[0]} />);
    const videoTitle = wrapper.find('#video-text');
    let actual;
    let expected;


    actual = videoTitle.find('#video-title').props().children;
    expected = mock.items[0].snippet.title;
    assert.equal(actual, expected, 'Video title');


    actual = videoTitle.find('#video-description').props().children;
    expected = mock.items[0].snippet.description;
    assert.equal(actual, expected, 'Video description');


    assert.end();
  });
});

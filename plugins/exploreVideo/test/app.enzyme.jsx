const { shallow } = require('enzyme');
const React = require('react');
const test = require('tape');

require('../../../test/setup.enzyme');
const App = require('../components/app');

test('Explore Video - App', (describe) => {
  describe.test('* YouTube API Video Search', async (assert) => {
    assert.plan(4);
    const wrapper = shallow(<App />);
    let actual;
    let expected;


    try {
      await wrapper.instance().videoSearch();


      actual = wrapper.state('selectedVideo');
      expected = null;
      assert.equal(actual, expected, 'Constructor value selectedVideo');


      actual = wrapper.state('videos').length;
      expected = 0;
      assert.equal(actual, expected, 'Constructor value videos');
    } catch (e) {
      assert.fail(e);
    }


    try {
      await wrapper.instance().videoSearch('vancouver');


      actual = wrapper.state('selectedVideo').kind;
      expected = 'youtube#searchResult';
      assert.equal(actual, expected, 'Live API call returns YouTube data');


      actual = wrapper.state('videos').length;
      expected = 0;
      assert.ok(actual > expected, 'Constructor value videos');

      assert.end();
    } catch (e) {
      assert.fail(e);
    }
  });
});

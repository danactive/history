import Adapter from 'enzyme-adapter-react-16';
import enzyme from 'enzyme';
import test from 'tape';
import React from 'react';

import '../../../../server/test/setup.enzyme';
import App from '../components/app';

test('Explore Video - App', (describe) => {
  const { shallow } = enzyme;

  enzyme.configure({ adapter: new Adapter() });

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
    } catch (e) {
      assert.fail(e);
    }
  });
});

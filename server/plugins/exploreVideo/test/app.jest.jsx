/* global describe, expect, shallow, test */
import React from 'react';

import App from '../components/app';

describe('Explore Video - App', () => {
  global._ = {
    debounce: () => {},
  };

  test('* YouTube API Video Search', async () => {
    expect.assertions(4);

    const wrapper = shallow(<App />);
    let actual;
    let expected;


    try {
      await wrapper.instance().videoSearch();


      actual = wrapper.state('selectedVideo');
      expected = null;
      expect(actual).toEqual(expected);


      actual = wrapper.state('videos').length;
      expected = 0;
      expect(actual).toEqual(expected);
    } catch (err) {
      expect(err).toBeUndefined();
    }


    try {
      await wrapper.instance().videoSearch('vancouver');


      actual = wrapper.state('selectedVideo').kind;
      expected = 'youtube#searchResult';
      expect(actual).toEqual(expected);


      actual = wrapper.state('videos').length;
      expected = 5;
      expect(actual).toEqual(expected);
    } catch (err) {
      expect(err).toBeUndefined();
    }
  });
});

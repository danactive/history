/* global describe, expect, shallow, test */
import moment from 'moment';
import React from 'react';

import Controls from '../components/controls';

describe('Walk - Controls (React Components)', () => {
  test('* Date picker - Render component', () => {
    const displayDate = moment('2017-10-31T00:00:00.000Z');

    // eslint-disable-next-line react/jsx-boolean-value
    const wrapper = shallow(<Controls date={displayDate} showControls />);

    let actual;
    let expected;

    actual = wrapper.state('date').format();
    expected = displayDate.format();
    expect(actual).toEqual(expected);


    actual = wrapper.html().includes('SingleDatePicker');
    expected = true;
    expect(actual).toEqual(expected);
  });

  test('* No date - Render component', () => {
    const wrapper = shallow(<Controls showControls={false} />);

    const actual = wrapper.html();
    const expected = '<section></section>';
    expect(actual).toEqual(expected);
  });
});

import Adapter from 'enzyme-adapter-react-16';
import enzyme from 'enzyme';
import moment from 'moment';
import React from 'react';
import test from 'tape';

import Controls from '../components/controls';

test('Walk - Controls (React Components)', (describe) => {
  const { shallow } = enzyme;

  enzyme.configure({ adapter: new Adapter() });

  describe.test('* Date - Render component', (assert) => {
    const wrapper = shallow(
      <Controls date={moment('2017-10-31T00:00:00.000Z')} />
    );

    const actual = wrapper.state('date').format();
    const expected = moment('2017-10-31T00:00:00.000Z').format();
    assert.equal(actual, expected, 'Dates match');

    assert.end();
  });
});

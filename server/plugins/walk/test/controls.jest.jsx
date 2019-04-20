import { configure, shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import { JSDOM } from 'jsdom';
import moment from 'moment';
import React from 'react';
import test from 'tape';

import Controls from '../components/controls';

function fakeDom(body) {
  const { window } = (new JSDOM(`<!doctype html><html><body>${body}</body></html>`));

  global.window = window;
  global.document = window.document;
}

test('Walk - Controls (React Components)', (describe) => {
  configure({ adapter: new Adapter() });

  describe.test('* Date picker - Render component', (assert) => {
    fakeDom('<div id="controls" data-has-image="true"></div>');
    const wrapper = shallow(<Controls date={moment('2017-10-31T00:00:00.000Z')} />);
    let actual;
    let expected;


    actual = wrapper.state('date').format();
    expected = moment('2017-10-31T00:00:00.000Z').format();
    assert.equal(actual, expected, 'Dates match');


    actual = wrapper.html().includes('SingleDatePicker');
    expected = true;
    assert.equal(actual, expected, 'CSS class found');


    assert.end();
  });

  describe.test('* No date - Render component', (assert) => {
    fakeDom('<section id="controls" data-has-image="false"></section>');
    const wrapper = shallow(<Controls />);

    const actual = wrapper.html();
    const expected = '<section></section>';
    assert.equal(actual, expected, 'Empty section tag');

    assert.end();
  });
});

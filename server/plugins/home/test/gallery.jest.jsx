import Adapter from 'enzyme-adapter-react-16';
import enzyme from 'enzyme';
import React from 'react';
import test from 'tape';

import '../../../test/setup.enzyme';
import Gallery from '../components/gallery';

test('Gallery - Page (React Component)', { skip: false }, (describe) => {
  const { mount } = enzyme;

  enzyme.configure({ adapter: new Adapter() });

  describe.test('* Parent element', (assert) => {
    const wrapper = mount(<Gallery gallery="demo" />);
    const aProps = wrapper.find('a').props();

    const actual = aProps.href;
    const expected = 'static/gallery-demo/xml/gallery.xml';
    assert.equal(actual, expected, 'Link to demo gallery');
    assert.end();
  });
});

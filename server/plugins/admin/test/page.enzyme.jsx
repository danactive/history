import Adapter from 'enzyme-adapter-react-16';
import enzyme from 'enzyme';
import React from 'react';
import test from 'tape';

import '../../../test/setup.enzyme';
import Page from '../components/page';

test('View Admin - Page (React Component)', { skip: false }, (describe) => {
  const { shallow } = enzyme;

  enzyme.configure({ adapter: new Adapter() });

  describe.test('* Page loads', (assert) => {
    const wrapper = shallow(<Page />);
    assert.ok(wrapper.contains(
      <a href="/edit/album">
        Edit Album
      </a>,
    ));
    assert.end();
  });
});

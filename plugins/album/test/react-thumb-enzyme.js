import test from 'tape'
import React from 'react'
import { shallow, mount } from 'enzyme';

import Thumb from '../views/thumb';

test('React Component - Thumb', (describe) => {
  const item = {
    mediaPath: 'c',
    thumbCaption: 'a',
    thumbPath: 'b',
  };

  describe.test('shallow', (assert) => {
    const wrapper = shallow(<Thumb item={item} />)
    assert.equal(wrapper.contains(<a href={item.mediaPath} rel="set">
      <img src={item.thumbPath} alt={item.thumbCaption} title={item.caption} />
    </a>), true);
    assert.equal(wrapper.contains(<div className="albumBoxPhotoCaption">{item.thumbCaption}</div>), true);
    assert.end();
  });
});

import test from 'tape'
import React from 'react'
import { shallow, mount } from 'enzyme';

import './react-enzyme-setup';
import Thumb from '../views/thumb';

test('React Component - Thumb', (describe) => {
  const item = {
    mediaPath: 'c',
    thumbCaption: 'a',
    thumbPath: 'b',
  };

  describe.test('* Thumbnail image and caption', (assert) => {
    const wrapper = shallow(<Thumb item={item} />)
    assert.ok(wrapper.contains(<img src={item.thumbPath} alt={item.thumbCaption} title={item.caption} />));
    assert.ok(wrapper.contains(<div className="albumBoxPhotoCaption">{item.thumbCaption}</div>));
    assert.end();
  });

  describe.test('* Title - Photo City', (assert) => {
    item.photoCity = 'Vancouver, BC';
    const wrapper = mount(<Thumb item={item} />);
    const title = wrapper.find('a').props().title;

    assert.equal(title, item.photoCity, 'Has title with Photo City');

    delete item.photoCity;
    assert.end();
  });

  describe.test('* Title - Wikipedia', (assert) => {
    item.ref = {
      name: "Vancouver_International_Airport",
      source: "wikipedia"
    };
    const wrapper = mount(<Thumb item={item} />);
    const title = wrapper.find('a').props().title;
    const titleHtml = '<a href=\'https://en.wikipedia.org/wiki/Vancouver_International_Airport\' target=\'_blank\'>Wiki</a>';

    assert.equal(title, titleHtml, 'Has title with Wikipedia link');

    delete item.ref;
    assert.end();
  });
});

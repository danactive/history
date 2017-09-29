import Adapter from 'enzyme-adapter-react-16';
import enzyme from 'enzyme';
import React from 'react';
import test from 'tape';

import '../../../test/setup.enzyme';
import Thumb from '../components/thumb';

test('View Album - Thumb (React Component)', { skip: false }, (describe) => {
  const item = {
    mediaPath: 'c',
    thumbCaption: 'a',
    thumbPath: 'b'
  };
  const { shallow, mount } = enzyme;

  enzyme.configure({ adapter: new Adapter() });

  describe.test('* Thumbnail image and caption', (assert) => {
    const wrapper = shallow(<Thumb item={item} />);
    assert.ok(wrapper.contains(<img src={item.thumbPath} alt={item.thumbCaption} title={item.caption} />));
    assert.ok(wrapper.contains(<div className="albumBoxPhotoCaption">{item.thumbCaption}</div>));
    assert.end();
  });

  describe.test('* Thumbnail missing geocode', (assert) => {
    const wrapper = mount(<Thumb item={item} />);
    const liProps = wrapper.find('li').props();
    assert.notOk(liProps['data-lon'], 'Missing longitude');
    assert.notOk(liProps['data-lat'], 'Missing latitude');
    assert.end();
  });

  describe.test('* Thumbnail has geocode', (assert) => {
    item.geo = {
      lat: 1,
      lon: 0
    };
    const wrapper = mount(<Thumb item={item} />);
    const liProps = wrapper.find('li').props();
    assert.equal(liProps['data-lon'], 0, 'Has longitude');
    assert.equal(liProps['data-lat'], 1, 'Has latitude');

    delete item.geo;

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
      name: 'Vancouver_International_Airport',
      source: 'wikipedia'
    };
    const wrapper = mount(<Thumb item={item} />);
    const title = wrapper.find('a').props().title;
    const titleHtml = '<a href=\'https://en.wikipedia.org/wiki/Vancouver_International_Airport\' target=\'_blank\'>Wiki</a>';

    assert.equal(title, titleHtml, 'Has title with Wikipedia link');

    delete item.ref;
    assert.end();
  });
});

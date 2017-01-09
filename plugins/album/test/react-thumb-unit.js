import React from 'react';
import { createRenderer } from 'react-addons-test-utils';
import createComponent from 'react-unit';
import tape from 'tape';
import addAssertions from 'extend-tape';
import jsxEquals from 'tape-jsx-equals';
import Thumb from '../views/thumb';

const test = addAssertions(tape, { jsxEquals });

test('React Component - Thumb', (describe) => {
  const item = {
    mediaPath: 'c',
    thumbCaption: 'a',
    thumbPath: 'b',
  };

  describe.test('* createComponent', { skip: false }, (assert) => {
    const component = createComponent.shallow(<Thumb item={item} />);

    assert.equal(component.props.className, 'liAlbumPhoto', 'CSS class name');
    assert.equal(component.text, item.thumbCaption, 'Caption');

    assert.end();
  });

  describe.test('* createRenderer', { skip: false }, (assert) => {
    const renderer = createRenderer();
    renderer.render(<Thumb item={item} />);
    const result = renderer.getRenderOutput();

    assert.jsxEquals(result, <li className="liAlbumPhoto">
      <div className="albumBoxPhotoImg">
        <a href="c" rel="set" title="">
          <img alt="a" src="b" title={undefined} />
        </a>
      </div>
      <div className="albumBoxPhotoCaption">a</div>
    </li>);

    assert.end();
  });

  describe.test('* Title - Photo City', { skip: false }, (assert) => {
    item.photoCity = 'Vancouver, BC';
    const component = createComponent.shallow(<Thumb item={item} />);
    const title = component.findByQuery('a')[0].props.title;

    assert.equal(title, item.photoCity, 'Has title with Photo City');

    delete item.photoCity;
    assert.end();
  });

  describe.test('* Title - Wikipedia', { skip: false }, (assert) => {
    item.ref = {
      name: 'Vancouver_International_Airport',
      source: 'wikipedia',
    };
    const component = createComponent.shallow(<Thumb item={item} />);
    const title = component.findByQuery('a')[0].props.title;
    const titleHtml = '<a href=\'https://en.wikipedia.org/wiki/Vancouver_International_Airport\' target=\'_blank\'>Wiki</a>';

    assert.equal(title, titleHtml, 'Has title with Wikipedia link');

    delete item.ref;
    assert.end();
  });
});

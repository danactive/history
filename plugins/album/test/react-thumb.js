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
        <a href="c" rel="set">
          <img alt="a" src="b" title={undefined} />
        </a>
      </div>
      <div className="albumBoxPhotoCaption">a</div>
    </li>);

    assert.end();
  });
});

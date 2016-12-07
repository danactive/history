import React from 'react';
import { createRenderer } from 'react-addons-test-utils';
import createComponent from 'react-unit';
import tape from 'tape';
import addAssertions from 'extend-tape';
import jsxEquals from 'tape-jsx-equals';
const test = addAssertions(tape, {jsxEquals});

// Component to test
import Button from './Button';

test('----- React Component Tests: Button -----', (t) => {

  // Shallow rendering: Render React element only *one* level deep
  const component = createComponent.shallow(<Button label="share" />);

  // Test component props and content
  t.equal(component.props.className, 'default-class', 'ClassName props of component should equal "share"');
  t.equal(component.text, 'share', 'Label props of component should be rendered as Button text "share"');

  // Test rendered output
  const renderer = createRenderer();
  renderer.render(<Button label="share" />);
  const result = renderer.getRenderOutput();
  t.jsxEquals(result, <div className="default-class">share</div>);

  t.end();
});

/* global document */
import 'react-dates/lib/css/_datepicker.css';

const React = require('react');
const ReactDOM = require('react-dom');

const browser = require('../../../lib/browser');
const Controls = require('../components/controls.jsx');
const PreviewThumbContainer = require('../../../../app/containers/PreviewThumb');

const PreviewThumb = React.createFactory(PreviewThumbContainer);

function renderViewDrain(containers) {
  if (containers.length === 0) {
    return;
  }

  const container = containers.pop();
  const data = { filename: container.getAttribute('data-filename') };

  ReactDOM.render(PreviewThumb(data), container);
  renderViewDrain(containers);
}

function renderView(htmlCollection) {
  if (htmlCollection.pop) {
    renderViewDrain(htmlCollection);
    return;
  }

  renderViewDrain(Array.from(htmlCollection));
}

renderView(document.getElementsByClassName('preview'));


browser.renderComponentToDom({ AppComponent: Controls, domSelector: '#controls' });

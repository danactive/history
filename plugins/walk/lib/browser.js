/* global document */
const React = require('react');
const ReactDOM = require('react-dom');
const AppComponent = require('../views/thumbnail.jsx');

const App = React.createFactory(AppComponent);

function renderViewDrain(containers) {
  if (containers.length === 0) {
    return;
  }

  const container = containers.pop();
  const data = { filename: container.getAttribute('data-filename') };

  ReactDOM.render(App(data), container);
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

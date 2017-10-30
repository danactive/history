/* global document, window */
const React = require('react');
const ReactDOM = require('react-dom');

function renderComponentToDom({ AppComponent, domSelector }) {
  const App = React.createFactory(AppComponent);
  const mountNode = document.querySelector(domSelector);
  const serverState = window.state;

  ReactDOM.render(App(serverState), mountNode);
}

module.exports = { renderComponentToDom };

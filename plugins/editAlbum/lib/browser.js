/* global document, window */
const React = require('react');
const ReactDOM = require('react-dom');
const AppComponent = require('../components/gallery.jsx');


const App = React.createFactory(AppComponent);
const mountNode = document.getElementById('galleryDropdown');
const serverState = window.state;

ReactDOM.render(App(serverState), mountNode);

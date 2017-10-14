const AppComponent = require('../components/app.jsx');
const browser = require('../../../lib/browser');

browser.renderComponentToDom({ AppComponent, domSelector: '#video-container' });

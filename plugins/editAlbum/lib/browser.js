const AppComponent = require('../components/gallery.jsx');
const browser = require('../../../lib/browser');

browser.renderComponentToDom({ AppComponent, domSelector: '#galleryDropdown' });

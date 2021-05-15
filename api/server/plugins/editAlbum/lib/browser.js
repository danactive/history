const AppComponent = require('../components/gallery');
const browser = require('../../../lib/browser');

browser.renderComponentToDom({ AppComponent, domSelector: '#galleryDropdown' });

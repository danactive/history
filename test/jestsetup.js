import {
  configure,
  mount,
  shallow,
} from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import fetch from 'isomorphic-fetch';

configure({ adapter: new Adapter() });

global.fetch = fetch;
// Make Enzyme functions available in all test files without importing
global.mount = mount;
global.shallow = shallow;

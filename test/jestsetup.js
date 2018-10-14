import {
  configure,
  mount,
  shallow,
} from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

configure({ adapter: new Adapter() });

// Make Enzyme functions available in all test files without importing
global.mount = mount;
global.shallow = shallow;

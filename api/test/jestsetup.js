import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import fetch from 'isomorphic-fetch';

Enzyme.configure({ adapter: new Adapter() });

global.fetch = fetch;
global.mount = Enzyme.mount;
global.shallow = Enzyme.shallow;

import Adapter from 'enzyme-adapter-react-16';
import enzyme from 'enzyme';
import React from 'react';
import test from 'tape';
import sinon from 'sinon';

import '../../../test/setup.enzyme';
import SearchBar from '../components/searchBar';

const { shallow } = enzyme;

enzyme.configure({ adapter: new Adapter() });

test('Explore Video - Search Bar', (describe) => {
  describe.test('* Retrieve web address from browser', (assert) => {
    const actual = SearchBar.getQS();
    const expected = '';
    assert.equal(actual, expected, 'Not supported in Node.js');

    assert.end();
  });

  describe.test('* Parse geocode from web address', (assert) => {
    let actual;
    let expected;

    actual = SearchBar.getGeoCode('');
    expected = '';
    assert.equal(actual, expected, 'Blank');


    actual = SearchBar.getGeoCode('https://vancouver.bc.ca/address');
    expected = '';
    assert.equal(actual, expected, 'URI');


    actual = SearchBar.getGeoCode('https://vancouver.bc.ca/address?geo=49.25,-123.1');
    expected = '49.25,-123.1';
    assert.equal(actual, expected, 'URI and query string');


    actual = SearchBar.getGeoCode('?city=darwin&geo=-12.45,130.833333&tld=au');
    expected = '-12.45,130.833333';
    assert.equal(actual, expected, 'Query string with multiple params');


    assert.end();
  });
});

test('Explore Video - Search Bar (React Component)', (describe) => {
  describe.test('* Render input element', (assert) => {
    const wrapper = shallow(<SearchBar onSearchChange={() => {}} />);
    const {
      placeholder,
      title,
      value
    } = wrapper.find('input').props();
    let actual;
    let expected;


    actual = placeholder;
    expected = SearchBar.defaults.instruction;
    assert.equal(actual, expected, 'Placeholder');


    actual = title;
    expected = SearchBar.defaults.instruction;
    assert.equal(actual, expected, 'Title');


    actual = value;
    expected = SearchBar.defaults.geocode;
    assert.equal(actual, expected, 'Value');


    assert.end();
  });

  describe.test('* Simulates event(s)', (assert) => {
    const onSearchChange = sinon.spy();
    const wrapper = shallow(<SearchBar onSearchChange={onSearchChange} />);


    assert.ok(onSearchChange.calledOnce, 'Search not executed');
    wrapper.find('input').simulate('change', { target: { value: 'boring' } });
    assert.ok(onSearchChange.calledTwice, 'Search executed');


    const actual = wrapper.find('input').props().value;
    const expected = 'boring';
    assert.equal(actual, expected, 'Search input value');


    assert.end();
  });
});

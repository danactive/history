const { shallow } = require('enzyme');
const React = require('react');
const sinon = require('sinon');
const test = require('tape');

require('../../../test/setup.enzyme');
const SearchBar = require('../components/searchBar');

test('Explore Video', (describe) => {
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
    const props = wrapper.find('input').props();
    let actual;
    let expected;


    actual = props.placeholder;
    expected = SearchBar.defaults.instruction;
    assert.equal(actual, expected, 'Placeholder');


    actual = props.title;
    expected = SearchBar.defaults.instruction;
    assert.equal(actual, expected, 'Title');


    actual = props.value;
    expected = SearchBar.defaults.geocode;
    assert.equal(actual, expected, 'Value');


    assert.end();
  });

  describe.test('* Simulates event(s)', (assert) => {
    const onSearchChange = sinon.spy();
    const wrapper = shallow(<SearchBar onSearchChange={onSearchChange} />);


    assert.notOk(onSearchChange.calledOnce, 'Search not executed');
    wrapper.find('input').simulate('change', { target: { value: 'boring' } });
    assert.ok(onSearchChange.calledOnce, 'Search executed');


    const actual = wrapper.find('input').props().value;
    const expected = 'boring';
    assert.equal(actual, expected, 'Search input value');


    assert.end();
  });
});

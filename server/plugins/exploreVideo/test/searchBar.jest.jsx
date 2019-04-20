/* global describe, expect, jest, shallow, test */
import React from 'react';

import SearchBar from '../components/searchBar';

describe('Explore Video - Search Bar', () => {
  test('* Retrieve web address from browser', () => {
    const actual = SearchBar.getQS();
    const expected = '';

    expect(actual).toEqual(expected);
  });

  test('* Parse geocode from web address', () => {
    let actual;
    let expected;

    actual = SearchBar.getGeoCode('');
    expected = '';
    expect(actual).toEqual(expected);


    actual = SearchBar.getGeoCode('https://vancouver.bc.ca/address');
    expected = '';
    expect(actual).toEqual(expected);


    actual = SearchBar.getGeoCode('https://vancouver.bc.ca/address?geo=49.25,-123.1');
    expected = '49.25,-123.1';
    expect(actual).toEqual(expected);


    actual = SearchBar.getGeoCode('?city=darwin&geo=-12.45,130.833333&tld=au');
    expected = '-12.45,130.833333';
    expect(actual).toEqual(expected);
  });
});

describe('Explore Video - Search Bar (React Component)', () => {
  test('* Render input element', () => {
    const wrapper = shallow(<SearchBar onSearchChange={() => {}} />);
    const {
      placeholder,
      title,
      value,
    } = wrapper.find('input').props();
    let actual;
    let expected;


    actual = placeholder;
    expected = SearchBar.defaults.instruction;
    expect(actual).toEqual(expected);


    actual = title;
    expected = SearchBar.defaults.instruction;
    expect(actual).toEqual(expected);


    actual = value;
    expected = SearchBar.defaults.geocode;
    expect(actual).toEqual(expected);
  });

  test('* Simulates event(s)', () => {
    const searchChangeEvent = jest.fn();
    const searchKeyword = 'vancouver';

    const wrapper = shallow(<SearchBar onSearchChange={searchChangeEvent} />);
    expect(searchChangeEvent).toHaveBeenCalledTimes(1);

    wrapper.find('input').simulate('change', { target: { value: searchKeyword } });
    expect(searchChangeEvent).toHaveBeenLastCalledWith(searchKeyword, { searchOrder: SearchBar.defaults.searchOrder });


    const actual = wrapper.find('input').props().value;
    const expected = searchKeyword;
    expect(actual).toEqual(expected);
  });
});

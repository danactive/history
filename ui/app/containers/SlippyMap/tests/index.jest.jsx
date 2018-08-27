/* global expect, shallow, test */
import React from 'react';

import {
  transformMapOptions,
  transformSourceOptions,
} from '../options';
import SlippyMap from '../index';

jest.mock('react-mapbox-gl', () => jest.fn(() => {}));

const shallowComponent = (props = {}) => shallow(<SlippyMap {...props} />);

const getFeatureCollection = () => ({
  features: [],
  type: 'FeatureCollection',
});
const getFeature = (params) => {
  const {
    latitude = null,
    longitude = null,
    properties = {},
  } = params;

  return {
    geometry: {
      coordinates: [longitude, latitude],
      type: 'Point',
    },
    properties,
    type: 'Feature',
  };
};

describe('<SlippyMap />', () => {
  describe('transformSourceOptions', () => {
    it('should return a GeoJSON Feature Collection', () => {
      expect.hasAssertions();

      const received = transformSourceOptions().geoJsonSource.data;
      const expected = getFeatureCollection();
      expect(received).toEqual(expected);
    });

    it('should return a GeoJSON Feature Collection with Feature', () => {
      expect.hasAssertions();

      const received = transformSourceOptions([{ geo: [1, 2] }]).geoJsonSource.data;
      const expected = getFeatureCollection();
      expected.features.push(getFeature({ latitude: 2, longitude: 1 }));
      expect(received).toEqual(expected);
    });
  });

  describe('transformMapOptions', () => {
    const runOneTest = (testDatum, property, value) => {
      const received = transformMapOptions(testDatum)[property];
      expect(received).toEqual(value);
    };

    it('should not have a centre and zoom', () => {
      const testData = [
        undefined,
        [0],
        [1, 0],
        [0, 1],
        [null, null],
        [undefined, undefined],
      ];
      expect.assertions(testData.length * 2);

      testData.forEach(testDatum => runOneTest(testDatum, 'center', undefined));
      testData.forEach(testDatum => runOneTest(testDatum, 'zoom', undefined));
    });

    it('should have a centre and zoom', () => {
      const testData = [
        [1, 1],
        [-12, 34],
        [-12, -34],
        [12, -34],
        [12, 34],
        [12.34, 56.78],
      ];
      expect.assertions(testData.length * 2);

      testData.forEach(testDatum => runOneTest(testDatum, 'center', testDatum));
      testData.forEach(testDatum => runOneTest(testDatum, 'zoom', [14]));
    });
  });

  it('should render an <SlippyMap /> component', () => {
    expect.hasAssertions();

    const received = shallowComponent().children().length;
    const expected = 4;
    expect(received).toEqual(expected);
  });
});

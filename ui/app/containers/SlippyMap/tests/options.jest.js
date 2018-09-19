/* global describe, expect, jest, it, shallow */
import {
  transformMapOptions,
  transformSourceOptions,
} from '../options';

const getFeatureCollection = () => ({
  features: [],
  type: 'FeatureCollection',
});
const getFeature = (params) => {
  const {
    latitude = 999, // invalid to catch bug in test
    longitude = 999,
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

describe('<SlippyMap /> options', () => {
  describe('transformSourceOptions', () => {
    it('should return a GeoJSON Feature Collection', () => {
      expect.hasAssertions();

      const received = transformSourceOptions().geoJsonSource.data;
      const expected = getFeatureCollection();
      expect(received).toEqual(expected);
    });

    it('should return a GeoJSON Feature Collection with Feature', () => {
      expect.hasAssertions();

      const received = transformSourceOptions({ items: [{ coordinates: [1, 2] }] }).geoJsonSource.data;
      const expected = getFeatureCollection();
      expected.features.push(getFeature({ latitude: 2, longitude: 1 }));
      expect(received).toEqual(expected);
    });

    it('should return a GeoJSON Feature Collection with suppressed Feature due to missing lat, long', () => {
      expect.hasAssertions();

      const received = transformSourceOptions({ items: [{ coordinates: [] }] }).geoJsonSource.data;
      const expected = getFeatureCollection();
      expect(received).toEqual(expected);
    });

    it('should return a GeoJSON Feature Collection with suppressed Feature due to NaN, NaN', () => {
      expect.hasAssertions();

      const received = transformSourceOptions({ items: [{ coordinates: [NaN, NaN] }] }).geoJsonSource.data;
      const expected = getFeatureCollection();
      expect(received).toEqual(expected);
    });

    it('should return a GeoJSON Feature Collection with Feature and suppressed Feature', () => {
      expect.hasAssertions();

      const received = transformSourceOptions({ items: [{ coordinates: [1, 2] }, { coordinates: [] }] }).geoJsonSource.data;
      const expected = getFeatureCollection();
      expected.features.push(getFeature({ latitude: 2, longitude: 1 }));
      expect(received).toEqual(expected);
    });
  });

  describe('transformMapOptions', () => {
    const runOneTest = (testDatum, property, value) => {
      const received = transformMapOptions({ coordinates: testDatum })[property];
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
      testData.forEach(testDatum => runOneTest(testDatum, 'zoom', [16]));
    });

    it('should have not a centre and zoom', () => {
      const testData = [
        [null, null],
        [undefined, undefined],
        [NaN, NaN],
      ];
      expect.assertions(testData.length * 2);

      testData.forEach(testDatum => runOneTest(testDatum, 'center', undefined));
      testData.forEach(testDatum => runOneTest(testDatum, 'zoom', undefined));
    });
  });
});

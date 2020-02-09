/* global describe, expect, test */

import { defaultAction } from '../actions';
import { DEFAULT_ACTION } from '../constants';

describe('Walk actions', () => {
  describe('Default Action', () => {
    test('has a type of DEFAULT_ACTION', () => {
      const expected = {
        type: DEFAULT_ACTION,
      };
      expect(defaultAction()).toEqual(expected);
    });
  });
});

import {
  CHOOSE_MEMORY,
} from './constants';

export function chooseMemory(id) {
  return {
    type: CHOOSE_MEMORY,
    id,
  };
}

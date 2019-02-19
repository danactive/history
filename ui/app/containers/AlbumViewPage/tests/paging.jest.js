/* global describe, expect, test */
import { getPage, insertPage } from '../paging';

function checkAll(list) {
  expect(list[0].id).toEqual(1);
  expect(list[1].id).toEqual(2);
  expect(list[2].id).toEqual(3);
  expect(list[3].id).toEqual(4);
  expect(list[4].id).toEqual(5);
}

const PAGE_SIZE = 2;
const fixtures = [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }];

describe('Get Page', () => {
  test('should get the zero page', () => {
    const result = getPage({ pageSize: PAGE_SIZE, list: fixtures, page: 0 });

    const received = result[0];
    const expected = undefined;
    expect(received).toEqual(expected);
  });

  test('first page should be full', () => {
    const result = getPage({ pageSize: PAGE_SIZE, list: fixtures, page: 1 });
    let received;
    let expected;

    received = result[0].id;
    expected = 1;
    expect(received).toEqual(expected);

    received = result[1].id;
    expected = 2;
    expect(received).toEqual(expected);

    received = result[2]; // eslint-disable-line prefer-destructuring
    expected = undefined;
    expect(received).toEqual(expected);
  });

  test('second page should be full', () => {
    const result = getPage({ pageSize: PAGE_SIZE, list: fixtures, page: 2 });
    let received;
    let expected;

    received = result[0].id;
    expected = 3;
    expect(received).toEqual(expected);

    received = result[1].id;
    expected = 4;
    expect(received).toEqual(expected);

    received = result[2]; // eslint-disable-line prefer-destructuring
    expected = undefined;
    expect(received).toEqual(expected);
  });

  test('third page should be partial', () => {
    const result = getPage({ pageSize: PAGE_SIZE, list: fixtures, page: 3 });
    let received;
    let expected;

    received = result[0].id;
    expected = 5;
    expect(received).toEqual(expected);

    received = result[1]; // eslint-disable-line prefer-destructuring
    expected = undefined;
    expect(received).toEqual(expected);
  });

  test('fourth page should be empty', () => {
    const result = getPage({ pageSize: PAGE_SIZE, list: fixtures, page: 4 });

    const received = result[0];
    const expected = undefined;
    expect(received).toEqual(expected);
  });

  test('should not effect fixture', () => {
    expect(fixtures[0].id).toEqual(1);
    expect(fixtures[1].id).toEqual(2);
    expect(fixtures[2].id).toEqual(3);
    expect(fixtures[3].id).toEqual(4);
    expect(fixtures[4].id).toEqual(5);
  });
});

describe('Insert Page', () => {
  test('should not effect fixture', () => {
    checkAll(fixtures);
  });

  test('should not insert page 0', () => {
    const insert = [{ id: 'apple' }, { id: 'banana' }];
    const newList = insertPage({
      page: 0, insert, pageSize: PAGE_SIZE, list: fixtures,
    });
    checkAll(newList);
    checkAll(fixtures);
  });

  test('should insert page 1', () => {
    const insert = [{ id: 'apple' }, { id: 'banana' }];
    const newList = insertPage({
      page: 1, insert, pageSize: PAGE_SIZE, list: fixtures,
    });
    expect(insert[0].id).toEqual(newList[0].id);
    expect(insert[1].id).toEqual(newList[1].id);
    expect(fixtures[2].id).toEqual(newList[2].id);
    expect(fixtures[3].id).toEqual(newList[3].id);
    expect(fixtures[4].id).toEqual(newList[4].id);
    checkAll(fixtures);
  });

  test('should insert page 2', () => {
    const insert = [{ id: 'cherry' }, { id: 'durrian' }];
    const newList = insertPage({
      page: 2, insert, pageSize: PAGE_SIZE, list: fixtures,
    });
    expect(fixtures[0].id).toEqual(newList[0].id);
    expect(fixtures[1].id).toEqual(newList[1].id);
    expect(insert[0].id).toEqual(newList[2].id);
    expect(insert[1].id).toEqual(newList[3].id);
    expect(fixtures[4].id).toEqual(newList[4].id);
    checkAll(fixtures);
  });

  test('should insert page 3', () => {
    const insert = [{ id: 'eggplant' }, { id: 'fig' }];
    const newList = insertPage({
      page: 3, insert, pageSize: PAGE_SIZE, list: fixtures,
    });
    expect(fixtures[0].id).toEqual(newList[0].id);
    expect(fixtures[1].id).toEqual(newList[1].id);
    expect(fixtures[2].id).toEqual(newList[2].id);
    expect(fixtures[3].id).toEqual(newList[3].id);
    expect(insert[0].id).toEqual(newList[4].id);
    checkAll(fixtures);
  });

  test('should not effect fixture', () => {
    checkAll(fixtures);
  });
});

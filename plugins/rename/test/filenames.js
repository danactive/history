'use strict';
const test = require('tape');

test('One photo per day', (assert) => {
  const module = require('../lib/filenames');
  const prefix = '2016-01-01';
  const result = module.getFutureFilenames(prefix, 1);

  assert.equal(result.filenames[0], `${prefix}-50.jpg`, 'Filename');
  assert.equal(result.files[0], `${prefix}-50`, 'File');
  assert.equal(result.xml, `<photo id="1"><filename>${prefix}-50.jpg</filename></photo>`, 'XML');
  assert.end();
});

test('Two photos per day', (assert) => {
  const module = require('../lib/filenames');
  const prefix = '2016-02-02';
  const result = module.getFutureFilenames(prefix, 2);

  assert.equal(result.filenames[0], `${prefix}-50.jpg`, 'Filename');
  assert.equal(result.filenames[1], `${prefix}-90.jpg`, 'Filename');
  assert.equal(result.files[0], `${prefix}-50`, 'File');
  assert.equal(result.files[1], `${prefix}-90`, 'File');
  assert.equal(result.xml,
    `<photo id="1"><filename>${prefix}-50.jpg</filename></photo>` +
    `<photo id="2"><filename>${prefix}-90.jpg</filename></photo>`,
    'XML');
  assert.end();
});

test('Three photos per day', (assert) => {
  const module = require('../lib/filenames');
  const prefix = '2016-03-03';
  const result = module.getFutureFilenames(prefix, 3);

  assert.equal(result.filenames[0], `${prefix}-37.jpg`, 'Filename');
  assert.equal(result.filenames[1], `${prefix}-64.jpg`, 'Filename');
  assert.equal(result.filenames[2], `${prefix}-90.jpg`, 'Filename');
  assert.equal(result.files[0], `${prefix}-37`, 'File');
  assert.equal(result.files[1], `${prefix}-64`, 'File');
  assert.equal(result.files[2], `${prefix}-90`, 'File');
  assert.equal(result.xml,
    `<photo id="1"><filename>${prefix}-37.jpg</filename></photo>` +
    `<photo id="2"><filename>${prefix}-64.jpg</filename></photo>` +
    `<photo id="3"><filename>${prefix}-90.jpg</filename></photo>`,
    'XML');
  assert.end();
});

test('Four photos per day', (assert) => {
  const module = require('../lib/filenames');
  const prefix = '2016-04-04';
  const result = module.getFutureFilenames(prefix, 4);

  assert.equal(result.filenames[0], `${prefix}-30.jpg`, 'Filename');
  assert.equal(result.filenames[1], `${prefix}-50.jpg`, 'Filename');
  assert.equal(result.filenames[2], `${prefix}-70.jpg`, 'Filename');
  assert.equal(result.filenames[3], `${prefix}-90.jpg`, 'Filename');
  assert.equal(result.files[0], `${prefix}-30`, 'File');
  assert.equal(result.files[1], `${prefix}-50`, 'File');
  assert.equal(result.files[2], `${prefix}-70`, 'File');
  assert.equal(result.files[3], `${prefix}-90`, 'File');
  assert.end();
});

test('Five photos per day', (assert) => {
  const module = require('../lib/filenames');
  const prefix = '2016-04-04';
  const result = module.getFutureFilenames(prefix, 5);

  assert.equal(result.filenames[0], `${prefix}-26.jpg`, 'Filename');
  assert.equal(result.filenames[1], `${prefix}-42.jpg`, 'Filename');
  assert.equal(result.filenames[2], `${prefix}-58.jpg`, 'Filename');
  assert.equal(result.filenames[3], `${prefix}-74.jpg`, 'Filename');
  assert.equal(result.filenames[4], `${prefix}-90.jpg`, 'Filename');
  assert.equal(result.files[0], `${prefix}-26`, 'File');
  assert.equal(result.files[1], `${prefix}-42`, 'File');
  assert.equal(result.files[2], `${prefix}-58`, 'File');
  assert.equal(result.files[3], `${prefix}-74`, 'File');
  assert.equal(result.files[4], `${prefix}-90`, 'File');
  assert.end();
});

test('34 photos per day', (assert) => {
  const module = require('../lib/filenames');
  const prefix = '2016-06-15';
  const result = module.getFutureFilenames(prefix, 34);

  assert.equal(result.files[0], `${prefix}-12`, 'File');
  assert.equal(result.files[1], `${prefix}-14`, 'File');
  assert.equal(result.files[2], `${prefix}-17`, 'File');
  assert.equal(result.files[3], `${prefix}-19`, 'File');
  assert.equal(result.files[4], `${prefix}-21`, 'File');
  assert.equal(result.files[5], `${prefix}-24`, 'File');
  assert.equal(result.files[6], `${prefix}-26`, 'File');
  assert.equal(result.files[7], `${prefix}-29`, 'File');
  assert.equal(result.files[8], `${prefix}-31`, 'File');
  assert.equal(result.files[9], `${prefix}-33`, 'File');
  assert.equal(result.files[10], `${prefix}-36`, 'File');
  assert.equal(result.files[11], `${prefix}-38`, 'File');
  assert.equal(result.files[12], `${prefix}-40`, 'File');
  assert.equal(result.files[13], `${prefix}-43`, 'File');
  assert.equal(result.files[14], `${prefix}-45`, 'File');
  assert.equal(result.files[15], `${prefix}-48`, 'File');
  assert.equal(result.files[16], `${prefix}-50`, 'File');
  assert.equal(result.files[17], `${prefix}-52`, 'File');
  assert.equal(result.files[18], `${prefix}-55`, 'File');
  assert.equal(result.files[19], `${prefix}-57`, 'File');
  assert.equal(result.files[20], `${prefix}-60`, 'File');

  assert.equal(result.files[33], `${prefix}-90`, 'File');
  assert.end();
});

test('62 photos per day', (assert) => {
  const module = require('../lib/filenames');
  const prefix = '2016-12-31';
  const result = module.getFutureFilenames(prefix, 62);

  assert.equal(result.files[0], `${prefix}-11`, 'File');
  assert.equal(result.files[1], `${prefix}-12`, 'File');
  assert.equal(result.files[2], `${prefix}-13`, 'File');
  assert.equal(result.files[3], `${prefix}-15`, 'File');
  assert.equal(result.files[4], `${prefix}-16`, 'File');
  assert.equal(result.files[5], `${prefix}-17`, 'File');
  assert.equal(result.files[6], `${prefix}-19`, 'File');
  assert.equal(result.files[7], `${prefix}-20`, 'File');
  assert.equal(result.files[8], `${prefix}-21`, 'File');
  assert.equal(result.files[9], `${prefix}-23`, 'File');
  assert.equal(result.files[10], `${prefix}-24`, 'File');
  assert.equal(result.files[11], `${prefix}-25`, 'File');
  assert.equal(result.files[12], `${prefix}-26`, 'File');
  assert.equal(result.files[13], `${prefix}-28`, 'File');
  assert.equal(result.files[14], `${prefix}-29`, 'File');
  assert.equal(result.files[15], `${prefix}-30`, 'File');
  assert.equal(result.files[16], `${prefix}-32`, 'File');
  assert.equal(result.files[17], `${prefix}-33`, 'File');
  assert.equal(result.files[18], `${prefix}-34`, 'File');
  assert.equal(result.files[19], `${prefix}-36`, 'File');
  assert.equal(result.files[20], `${prefix}-37`, 'File');

  assert.equal(result.files[60], `${prefix}-89`, 'File');
  assert.equal(result.files[61], `${prefix}-90`, 'File');
  assert.end();
});

test('One photo per day with a XML starting point', (assert) => {
  const module = require('../lib/filenames');
  const prefix = '2016-01-01';
  const result = module.getFutureFilenames(prefix, 1, 10);

  assert.equal(result.filenames[0], `${prefix}-50.jpg`, 'Filename');
  assert.equal(result.files[0], `${prefix}-50`, 'File');
  assert.equal(result.xml, `<photo id="10"><filename>${prefix}-50.jpg</filename></photo>`, 'XML');
  assert.end();
});

test('Two photos per day with a XML starting point', (assert) => {
  const module = require('../lib/filenames');
  const prefix = '2016-02-02';
  const result = module.getFutureFilenames(prefix, 2, 20);

  assert.equal(result.filenames[0], `${prefix}-50.jpg`, 'Filename');
  assert.equal(result.filenames[1], `${prefix}-90.jpg`, 'Filename');
  assert.equal(result.files[0], `${prefix}-50`, 'File');
  assert.equal(result.files[1], `${prefix}-90`, 'File');
  assert.equal(result.xml,
    `<photo id="20"><filename>${prefix}-50.jpg</filename></photo>` +
    `<photo id="21"><filename>${prefix}-90.jpg</filename></photo>`,
    'XML');
  assert.end();
});

test('Three photos per day with a XML starting point', (assert) => {
  const module = require('../lib/filenames');
  const prefix = '2016-03-03';
  const result = module.getFutureFilenames(prefix, 3, 30);

  assert.equal(result.filenames[0], `${prefix}-37.jpg`, 'Filename');
  assert.equal(result.filenames[1], `${prefix}-64.jpg`, 'Filename');
  assert.equal(result.filenames[2], `${prefix}-90.jpg`, 'Filename');
  assert.equal(result.files[0], `${prefix}-37`, 'File');
  assert.equal(result.files[1], `${prefix}-64`, 'File');
  assert.equal(result.files[2], `${prefix}-90`, 'File');
  assert.equal(result.xml,
    `<photo id="30"><filename>${prefix}-37.jpg</filename></photo>` +
    `<photo id="31"><filename>${prefix}-64.jpg</filename></photo>` +
    `<photo id="32"><filename>${prefix}-90.jpg</filename></photo>`,
    'XML');
  assert.end();
});

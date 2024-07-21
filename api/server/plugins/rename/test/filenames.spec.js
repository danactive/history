const tape = require('tape-catch');
// Ported to Next.js
tape('Filenames', { skip: false }, (describe) => {
  const lib = require('../lib/filenames');

  /*
   *     #     #                                  #######
   *     #     # #    # #  ####  #    # ######    #       # #      ######  ####
   *     #     # ##   # # #    # #    # #         #       # #      #      #
   *     #     # # #  # # #    # #    # #####     #####   # #      #####   ####
   *     #     # #  # # # #  # # #    # #         #       # #      #           #
   *     #     # #   ## # #   #  #    # #         #       # #      #      #    #
   *      #####  #    # #  ### #  ####  ######    #       # ###### ######  ####
   *
   */
  describe.test('One photo per day', { skip: false }, (assert) => {
    const sourceFilenames = ['media1.jpg'];
    const result = lib.uniqueFiles(sourceFilenames);
    const results = result.values();

    assert.equal(result.size, 1, 'Count');
    assert.equal(results.next().value, 'media1', 'Name');
    assert.end();
  });

  describe.test('Two photos per day', { skip: false }, (assert) => {
    const sourceFilenames = ['media1.jpg', 'media1.avi', 'media2.jpg'];
    const result = lib.uniqueFiles(sourceFilenames);
    const results = result.values();

    assert.equal(result.size, 2, 'Count');
    assert.equal(results.next().value, 'media1', 'Name');
    assert.equal(results.next().value, 'media2', 'Name');
    assert.end();
  });

  describe.test('Three photos per day', { skip: false }, (assert) => {
    const sourceFilenames = ['media1.jpg', 'media2.avi', 'media3.mts'];
    const result = lib.uniqueFiles(sourceFilenames);
    const results = result.values();

    assert.equal(result.size, 3, 'Count');
    assert.equal(results.next().value, 'media1', 'Name');
    assert.equal(results.next().value, 'media2', 'Name');
    assert.equal(results.next().value, 'media3', 'Name');
    assert.end();
  });

  /*
   *     #     #                           #######
   *     #     # # #####  ######  ####        #    #   # #####  ######
   *     #     # # #    # #      #    #       #     # #  #    # #
   *     #     # # #    # #####  #    #       #      #   #    # #####
   *      #   #  # #    # #      #    #       #      #   #####  #
   *       # #   # #    # #      #    #       #      #   #      #
   *        #    # #####  ######  ####        #      #   #      ######
   *
   */
  describe.test('Blank photo', { skip: false }, (assert) => {
    const sourceFilenames = [''];
    const result = lib.videoTypeInList(sourceFilenames, 'media1');

    assert.equal(result, false, 'No video');
    assert.end();
  });

  describe.test('One photo', { skip: false }, (assert) => {
    const sourceFilenames = ['media1.jpg'];
    const result = lib.videoTypeInList(sourceFilenames, 'media1');

    assert.equal(result, false, 'No video');
    assert.end();
  });

  describe.test('Two photos', { skip: false }, (assert) => {
    const sourceFilenames = ['media1.jpg', 'media2.jpg', 'media2.avi'];
    const result = lib.videoTypeInList(sourceFilenames, 'media2');

    assert.equal(result, true, 'Video found');
    assert.end();
  });

  /*
   *     #######                                      #######
   *     #       #    # ##### #    # #####  ######    #       # #      ###### #    #   ##   #    # ######  ####
   *     #       #    #   #   #    # #    # #         #       # #      #      ##   #  #  #  ##  ## #      #
   *     #####   #    #   #   #    # #    # #####     #####   # #      #####  # #  # #    # # ## # #####   ####
   *     #       #    #   #   #    # #####  #         #       # #      #      #  # # ###### #    # #           #
   *     #       #    #   #   #    # #   #  #         #       # #      #      #   ## #    # #    # #      #    #
   *     #        ####    #    ####  #    # ######    #       # ###### ###### #    # #    # #    # ######  ####
   *
   */
  describe.test('One photo per day', { skip: false }, (assert) => {
    const sourceFilenames = ['media1.jpg'];
    const prefix = '2016-12-01';
    const result = lib.futureFilenamesOutputs(sourceFilenames, prefix);

    assert.equal(result.filenames[0], `${prefix}-50.jpg`, 'Filename');
    assert.equal(result.files[0], `${prefix}-50`, 'File');
    assert.equal(result.xml, `<item id="100"><filename>${prefix}-50.jpg</filename></item>`, 'XML');
    assert.end();
  });

  describe.test('Two photos per day', { skip: false }, (assert) => {
    const sourceFilenames = ['media1.jpg', 'media2.jpg'];
    const prefix = '2016-12-02';
    const result = lib.futureFilenamesOutputs(sourceFilenames, prefix);

    assert.equal(result.filenames[0], `${prefix}-50.jpg`, 'Filename');
    assert.equal(result.filenames[1], `${prefix}-90.jpg`, 'Filename');
    assert.equal(result.files[0], `${prefix}-50`, 'File');
    assert.equal(result.files[1], `${prefix}-90`, 'File');
    assert.equal(
      result.xml,
      `<item id="100"><filename>${prefix}-50.jpg</filename></item>`
      + `<item id="101"><filename>${prefix}-90.jpg</filename></item>`,
      'XML',
    );
    assert.end();
  });

  describe.test('Three photos per day', { skip: false }, (assert) => {
    const sourceFilenames = ['media1.jpg', 'media2.jpg', 'media3.jpeg'];
    const prefix = '2016-12-03';
    const result = lib.futureFilenamesOutputs(sourceFilenames, prefix);

    assert.equal(result.filenames[0], `${prefix}-37.jpg`, 'Filename');
    assert.equal(result.filenames[1], `${prefix}-64.jpg`, 'Filename');
    assert.equal(result.filenames[2], `${prefix}-90.jpg`, 'Filename');
    assert.equal(result.files[0], `${prefix}-37`, 'File');
    assert.equal(result.files[1], `${prefix}-64`, 'File');
    assert.equal(result.files[2], `${prefix}-90`, 'File');
    assert.equal(
      result.xml,
      `<item id="100"><filename>${prefix}-37.jpg</filename></item>`
      + `<item id="101"><filename>${prefix}-64.jpg</filename></item>`
      + `<item id="102"><filename>${prefix}-90.jpg</filename></item>`,
      'XML',
    );
    assert.end();
  });

  describe.test('Four photos per day', { skip: false }, (assert) => {
    const sourceFilenames = ['media1.jpg', 'media2.jpg', 'media3.jpeg', 'media3.m2ts', 'media4.jpeg'];
    const prefix = '2016-12-04';
    const result = lib.futureFilenamesOutputs(sourceFilenames, prefix);

    assert.equal(result.filenames[0], `${prefix}-30.jpg`, 'Filename');
    assert.equal(result.filenames[1], `${prefix}-50.jpg`, 'Filename');
    assert.equal(result.filenames[2], `${prefix}-70.jpg`, 'Filename');
    assert.equal(result.filenames[3], `${prefix}-90.jpg`, 'Filename');
    assert.equal(result.files[0], `${prefix}-30`, 'File');
    assert.equal(result.files[1], `${prefix}-50`, 'File');
    assert.equal(result.files[2], `${prefix}-70`, 'File');
    assert.equal(result.files[3], `${prefix}-90`, 'File');
    assert.equal(
      result.xml,
      `<item id="100"><filename>${prefix}-30.jpg</filename></item>`
      + `<item id="101"><filename>${prefix}-50.jpg</filename></item>`
      + `<item id="102"><type>video</type><filename>${prefix}-70.mp4</filename><filename>${prefix}-70.webm</filename></item>`
      + `<item id="103"><filename>${prefix}-90.jpg</filename></item>`,
      'XML',
    );
    assert.end();
  });

  describe.test('Five photos per day', { skip: false }, (assert) => {
    const sourceFilenames = ['media1.jpg', 'media2.jpg', 'media3.jpeg', 'media3.m2ts', 'media4.jpeg', 'media5.jpg'];
    const prefix = '2016-12-05';
    const result = lib.futureFilenamesOutputs(sourceFilenames, prefix);

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

  describe.test('34 photos per day', { skip: false }, (assert) => {
    const sourceFilenames = ['1.jpg', '2.jpg', '3.jpg', '4.jpg', '5.jpg', '6.jpg', '7.jpg', '8.jpg', '9.jpg', '10.jpg',
      '11.jpg', '12.jpg', '13.jpg', '14.jpg', '15.jpg', '16.jpg', '17.jpg', '18.jpg', '19.jpg', '20.jpg',
      '21.jpg', '22.jpg', '23.jpg', '24.jpg', '25.jpg', '26.jpg', '27.jpg', '28.jpg', '29.jpg', '30.jpg',
      '31.jpg', '32.jpg', '33.jpg', '34.jpg'];
    const prefix = '2017-01-03';
    const result = lib.futureFilenamesOutputs(sourceFilenames, prefix);

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

  describe.test('62 photos per day', { skip: false }, (assert) => {
    const sourceFilenames = ['1.jpg', '2.jpg', '3.jpg', '4.jpg', '5.jpg', '6.jpg', '7.jpg', '8.jpg', '9.jpg', '10.jpg',
      '11.jpg', '12.jpg', '13.jpg', '14.jpg', '15.jpg', '16.jpg', '17.jpg', '18.jpg', '19.jpg', '20.jpg',
      '21.jpg', '22.jpg', '23.jpg', '24.jpg', '25.jpg', '26.jpg', '27.jpg', '28.jpg', '29.jpg', '30.jpg',
      '31.jpg', '32.jpg', '33.jpg', '34.jpg', '35.jpg', '36.jpg', '37.jpg', '38.jpg', '39.jpg', '40.jpg',
      '41.jpg', '42.jpg', '43.jpg', '44.jpg', '45.jpg', '46.jpg', '47.jpg', '48.jpg', '49.jpg', '50.jpg',
      '51.jpg', '52.jpg', '53.jpg', '54.jpg', '55.jpg', '56.jpg', '57.jpg', '58.jpg', '59.jpg', '60.jpg',
      '61.jpg', '62.jpg'];
    const prefix = '2017-03-01';
    const result = lib.futureFilenamesOutputs(sourceFilenames, prefix);

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

  describe.test('One photo per day with a XML starting point', { skip: false }, (assert) => {
    const sourceFilenames = ['media1.arw', 'media1.mov', 'media1.jpg'];
    const prefix = '2016-01-31';
    const result = lib.futureFilenamesOutputs(sourceFilenames, prefix, 10);

    assert.equal(result.filenames[0], `${prefix}-50.jpg`, 'Filename');
    assert.equal(result.files[0], `${prefix}-50`, 'File');
    assert.equal(
      result.xml,
      `<item id="10"><type>video</type><filename>${prefix}-50.mp4</filename><filename>${prefix}-50.webm</filename></item>`,
      'XML',
    );
    assert.end();
  });

  describe.test('Two photos per day with a XML starting point', { skip: false }, (assert) => {
    const sourceFilenames = ['media1.arw', 'media1.mts', 'media1.jpg', 'media2.raw', 'media2.avi', 'media2.jpg'];
    const prefix = '2016-02-31';
    const result = lib.futureFilenamesOutputs(sourceFilenames, prefix, 20);

    assert.equal(result.filenames[0], `${prefix}-50.jpg`, 'Filename');
    assert.equal(result.filenames[1], `${prefix}-90.jpg`, 'Filename');
    assert.equal(result.files[0], `${prefix}-50`, 'File');
    assert.equal(result.files[1], `${prefix}-90`, 'File');
    assert.equal(
      result.xml,
      `<item id="20"><type>video</type><filename>${prefix}-50.mp4</filename><filename>${prefix}-50.webm</filename></item>`
      + `<item id="21"><type>video</type><filename>${prefix}-90.mp4</filename><filename>${prefix}-90.webm</filename></item>`,
      'XML',
    );
    assert.end();
  });

  describe.test('Three photos per day with a XML starting point', { skip: false }, (assert) => {
    const sourceFilenames = ['media1.arw', 'media1.mov', 'media1.jpg', 'media2.raw', 'media2.avi', 'media2.jpg', 'media3.jpg'];
    const prefix = '2016-03-31';
    const result = lib.futureFilenamesOutputs(sourceFilenames, prefix, 30);

    assert.equal(result.filenames[0], `${prefix}-37.jpg`, 'Filename');
    assert.equal(result.filenames[1], `${prefix}-64.jpg`, 'Filename');
    assert.equal(result.filenames[2], `${prefix}-90.jpg`, 'Filename');
    assert.equal(result.files[0], `${prefix}-37`, 'File');
    assert.equal(result.files[1], `${prefix}-64`, 'File');
    assert.equal(result.files[2], `${prefix}-90`, 'File');
    assert.equal(
      result.xml,
      `<item id="30"><type>video</type><filename>${prefix}-37.mp4</filename><filename>${prefix}-37.webm</filename></item>`
      + `<item id="31"><type>video</type><filename>${prefix}-64.mp4</filename><filename>${prefix}-64.webm</filename></item>`
      + `<item id="32"><filename>${prefix}-90.jpg</filename></item>`,
      'XML',
    );
    assert.end();
  });
});

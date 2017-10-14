/* global require */
const tape = require('tape-catch');

tape('Verify rename library', { skip: false }, (describe) => {
  const appRoot = require('app-root-path');
  const path = require('path');

  const exist = require('../../exists/lib/exists');
  const plugin = require('../lib/rename');
  const utils = require('../../utils');

  /*
  *######                                                    #
  *#     # ######   ##    ####   ####  #  ####  #    #      # #    ####   ####   ####   ####  #   ##   ##### ###### #####
  *#     # #       #  #  #      #      # #    # ##   #     #   #  #      #      #    # #    # #  #  #    #   #      #    #
  *######  #####  #    #  ####   ####  # #      # #  #    #     #  ####   ####  #    # #      # #    #   #   #####  #    #
  *#   #   #      ######      #      # # #  ### #  # #    #######      #      # #    # #      # ######   #   #      #    #
  *#    #  #      #    # #    # #    # # #    # #   ##    #     # #    # #    # #    # #    # # #    #   #   #      #    #
  *#     # ###### #    #  ####   ####  #  ####  #    #    #     #  ####   ####   ####   ####  # #    #   #   ###### #####
  *
  */
  describe.test('* Reassign many associated absolute filenames', { skip: false }, (assert) => {
    const filepath = appRoot.resolve('./plugins/rename/test/fixtures/renameable/');
    const absoluteAssociatedFilenames = [`${filepath}bee.bat`, `${filepath}bee.bin`, `${filepath}bee.bmp`];
    const futureFile = 'future';
    const futureAssociatedFilenames = [
      `${filepath}${futureFile}.bat`,
      `${filepath}${futureFile}.bin`,
      `${filepath}${futureFile}.bmp`
    ];

    assert.plan(1);
    plugin.reassignAssociated(absoluteAssociatedFilenames, futureFile)
      .then((futureFilenames) => {
        assert.deepEqual(futureAssociatedFilenames, futureFilenames, 'Reassigned filenames match');
      });
  });

  /*
  *      #####                                                            #     #
  *     #     # #    # #####  #####   ####  #####  ##### ###### #####     ##   ## ###### #####  #   ##
  *     #       #    # #    # #    # #    # #    #   #   #      #    #    # # # # #      #    # #  #  #
  *      #####  #    # #    # #    # #    # #    #   #   #####  #    #    #  #  # #####  #    # # #    #
  *           # #    # #####  #####  #    # #####    #   #      #    #    #     # #      #    # # ######
  *     #     # #    # #      #      #    # #   #    #   #      #    #    #     # #      #    # # #    #
  *      #####   ####  #      #       ####  #    #   #   ###### #####     #     # ###### #####  # #    #
  *
  */
  describe.test('* Failing supported browser media', { skip: false }, (assert) => {
    const file = '2016-12-31';
    const filenames = [
      `${file}.arw`,
      `${file}.bmp`,
      `${file}.psd`,
      `${file}.pdf`,
      `${file}.raw`
    ];

    assert.plan(filenames.length);
    filenames.forEach((filename) => {
      plugin.supportedBrowserMedia(filename)
        .then(supported => assert.notOk(supported));
    });
  });

  describe.test('* Passing supported browser media', { skip: false }, (assert) => {
    const file = '2016-12-31';
    const filenames = [
      `${file}.jpg`,
      `${file}.jpeg`,
      `${file}.mp4`,
      `${file}.webm`
    ];

    assert.plan(filenames.length);
    filenames.forEach((filename) => {
      plugin.supportedBrowserMedia(filename)
        .then(supported => assert.ok(supported));
    });
  });

  /*
  *     ######                                        ######
  *     #     # ###### #    #   ##   #    # ######    #     #   ##   ##### #    #  ####
  *     #     # #      ##   #  #  #  ##  ## #         #     #  #  #    #   #    # #
  *     ######  #####  # #  # #    # # ## # #####     ######  #    #   #   ######  ####
  *     #   #   #      #  # # ###### #    # #         #       ######   #   #    #      #
  *     #    #  #      #   ## #    # #    # #         #       #    #   #   #    # #    #
  *     #     # ###### #    # #    # #    # ######    #       #    #   #   #    #  ####
  *
  */
  describe.test('* Rename real source folder', { skip: false }, async (assert) => {
    const originals = ['cee.css', 'jay.js', 'el.log'];
    const temps = ['changed.css', 'renamed.js', 'temp.txt'];
    const sourceFolder = '/test/fixtures/renameable';

    const runTest = async ({ filenames, futureFilenames }) => {
      try {
        const result = await plugin.renamePaths(sourceFolder, filenames, futureFilenames);
        const uniqueResult = new Set(result);

        futureFilenames.forEach(async (filename) => {
          const fullPath = await utils.file.safePublicPath(path.join(sourceFolder, filename));
          assert.ok(uniqueResult.has(fullPath), 'Full path matches future path');
        });
      } catch (error) {
        assert.fail(`Rename failed ${error}`);
      }
    };

    await runTest({ filenames: originals, futureFilenames: temps });
    await runTest({ filenames: temps, futureFilenames: originals });

    assert.end();
  });

  describe.test('* Caught fake source folder', { skip: false }, (assert) => {
    const filenames = ['cee.css', 'jay.js', 'el.log'];
    const futureFilenames = ['changed.css', 'renamed.js', 'temp.txt'];
    const sourceFolder = '/test/fixtures/FAKE';

    assert.plan(1);
    plugin.renamePaths(sourceFolder, filenames, futureFilenames)
      .then(() => assert.fail('Code incorrectly found a fake folder'))
      .catch(() => assert.pass('Fake folder not found'));
  });

  describe.test('* Caught fake source filenames', { skip: false }, (assert) => {
    const filenames = ['FAKEcee.css', 'FAKEjay.js', 'FAKEel.log'];
    const futureFilenames = ['changed.css', 'renamed.js', 'temp.txt'];
    const sourceFolder = '/test/fixtures/renameable';

    assert.plan(1);
    plugin.renamePaths(sourceFolder, filenames, futureFilenames)
      .then(() => assert.fail('Code incorrectly found a fake filename'))
      .catch(() => assert.pass('Fake filename not found'));
  });

  describe.test('* Rename associated is false so one filename', { skip: false }, async (assert) => {
    const originals = ['bee.bat'];
    const temps = ['rename_grouped.bat'];
    const sourceFolder = '/test/fixtures/renameable';

    const runTest = async ({ filenames, futureFilenames }) => {
      try {
        const result = await plugin.renamePaths(sourceFolder, filenames, futureFilenames, { renameAssociated: false });
        const uniqueResult = new Set(result);

        futureFilenames.forEach(async (filename) => {
          const publicPath = await utils.file.safePublicPath(path.join(sourceFolder, filename));
          assert.ok(uniqueResult.has(publicPath), `Public path matches future path (${publicPath})`);
        });

        await exist.pathExists(`${sourceFolder}/bee.bin`);
        assert.pass('Associated bee.bin file remains untouched');

        await exist.pathExists(`${sourceFolder}/bee.bmp`);
        assert.pass('Associated bee.bmp file remains untouched');
      } catch (error) {
        assert.fail(`Rename failed ${error}`);
      }
    };

    await runTest({ filenames: originals, futureFilenames: temps });
    await runTest({ filenames: temps, futureFilenames: originals });

    assert.end();
  });

  describe.test('* Rename associated is true so six filenames', { skip: false }, async (assert) => {
    const originals = ['bee.bat', 'tee.txt'];
    const temps = ['rename_grouped.bat', 'rename_associated.txt'];
    const sourceFolder = '/test/fixtures/renameable';
    const expectedTemp = ['rename_grouped.bat', 'rename_grouped.bin', 'rename_grouped.bmp',
      'rename_associated.tar', 'rename_associated.tax', 'rename_associated.txt'];
    const expectedOriginal = ['bee.bat', 'bee.bin', 'bee.bmp', 'tee.tar', 'tee.tax', 'tee.txt'];

    const runTest = async ({ expectedFilenames, filenames, futureFilenames }) => {
      try {
        const result = await plugin.renamePaths(sourceFolder, filenames, futureFilenames, { renameAssociated: true });
        const uniqueResult = new Set(result);

        expectedFilenames.forEach(async (filename) => {
          const fullPath = await utils.file.safePublicPath(path.join(sourceFolder, filename));
          assert.ok(uniqueResult.has(fullPath), 'Full path matches future path');

          await exist.pathExists(`${sourceFolder}/${filename}`);
          assert.pass(`Associated ${filename} file renamed with associated`);
        });
      } catch (error) {
        assert.fail(`Rename failed ${error}`);
      }
    };

    await runTest({ filenames: originals, futureFilenames: temps, expectedFilenames: expectedTemp });
    await runTest({ filenames: temps, futureFilenames: originals, expectedFilenames: expectedOriginal });

    assert.end();
  });
});

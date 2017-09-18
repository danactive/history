/* global require */
const tape = require('tape-catch');

tape('Verify rename library', { skip: false }, (describe) => {
  const appRoot = require('app-root-path');
  const path = require('path');

  const exist = require('../../exists/lib/exists');
  const plugin = require('../lib/rename');

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
  describe.test('* Rename real source folder', { skip: false }, (assert) => {
    const filenames = ['cee.css', 'jay.js', 'el.log'];
    const futureFilenames = ['changed.css', 'renamed.js', 'temp.txt'];
    const sourceFolder = './plugins/rename/test/fixtures/renameable';

    plugin.renamePaths(sourceFolder, filenames, futureFilenames)
      .then((result) => {
        assert.plan(result.length);
        const uniqueResult = new Set(result);
        futureFilenames.forEach((filename) => {
          const fullPath = path.resolve(__dirname, '../../../', sourceFolder, filename);
          assert.ok(uniqueResult.has(fullPath), 'Full path matches future path');
        });
      })
      .catch(error => assert.fail(`Rename failed ${error}`) && assert.end());
  });

  describe.test('* Restore real source folder', { skip: false }, (assert) => {
    const filenames = ['changed.css', 'renamed.js', 'temp.txt'];
    const futureFilenames = ['cee.css', 'jay.js', 'el.log'];
    const sourceFolder = './plugins/rename/test/fixtures/renameable';

    plugin.renamePaths(sourceFolder, filenames, futureFilenames)
      .then((result) => {
        assert.plan(result.length);
        const uniqueResult = new Set(result);
        futureFilenames.forEach((filename) => {
          const fullPath = path.resolve(__dirname, '../../../', sourceFolder, filename);
          assert.ok(uniqueResult.has(fullPath), 'Full path matches future path');
        });
      })
      .catch(error => assert.fail(`Rename failed ${error}`) && assert.end());
  });

  describe.test('* Caught fake source folder', { skip: false }, (assert) => {
    const filenames = ['cee.css', 'jay.js', 'el.log'];
    const futureFilenames = ['changed.css', 'renamed.js', 'temp.txt'];
    const sourceFolder = './plugins/rename/test/fixtures/FAKE';

    assert.plan(1);
    plugin.renamePaths(sourceFolder, filenames, futureFilenames)
      .then(() => assert.fail('Code incorrectly found a fake folder'))
      .catch(() => assert.pass('Fake folder not found'));
  });

  describe.test('* Caught fake source filenames', { skip: false }, (assert) => {
    const filenames = ['FAKEcee.css', 'FAKEjay.js', 'FAKEel.log'];
    const futureFilenames = ['changed.css', 'renamed.js', 'temp.txt'];
    const sourceFolder = './plugins/rename/test/fixtures/renameable';

    assert.plan(1);
    plugin.renamePaths(sourceFolder, filenames, futureFilenames)
      .then(() => assert.fail('Code incorrectly found a fake filename'))
      .catch(() => assert.pass('Fake filename not found'));
  });

  describe.test('* Rename associated is false so one filename', { skip: false }, (assert) => {
    const filenames = ['bee.bat'];
    const futureFilenames = ['rename_grouped.bat'];
    const sourceFolder = './plugins/rename/test/fixtures/renameable';

    plugin.renamePaths(sourceFolder, filenames, futureFilenames, { renameAssociated: false })
      .then((result) => {
        assert.plan(result.length + 2);

        const uniqueResult = new Set(result);
        futureFilenames.forEach((filename) => {
          const fullPath = path.resolve(__dirname, '../../../', sourceFolder, filename);
          assert.ok(uniqueResult.has(fullPath), 'Full path matches future path');
        });

        exist.pathExists(`${sourceFolder}/bee.bin`)
          .then(() => assert.pass('Associated bee.bin file remains untouched'))
          .catch(error => assert.fail(`Bee.bin file does not exist ${error}`));
        exist.pathExists(`${sourceFolder}/bee.bmp`)
          .then(() => assert.pass('Associated bee.bmp file remains untouched'))
          .catch(error => assert.fail(`Bee.bmp file does not exist ${error}`));
      })
      .catch(error => assert.fail(`Rename failed ${error}`) && assert.end());
  });

  describe.test('* Restore associated is false so one filename', { skip: false }, (assert) => {
    const filenames = ['rename_grouped.bat'];
    const futureFilenames = ['bee.bat'];
    const sourceFolder = './plugins/rename/test/fixtures/renameable';

    plugin.renamePaths(sourceFolder, filenames, futureFilenames, { renameAssociated: false })
      .then((result) => {
        assert.plan(result.length);
        const uniqueResult = new Set(result);
        futureFilenames.forEach((filename) => {
          const fullPath = path.resolve(__dirname, '../../../', sourceFolder, filename);
          assert.ok(uniqueResult.has(fullPath), 'Full path matches future path');
        });
      })
      .catch(error => assert.fail(`Rename failed ${error}`) && assert.end());
  });

  describe.test('* Rename associated is true so six filenames', { skip: false }, (assert) => {
    const filenames = ['bee.bat', 'tee.txt'];
    const futureFilenames = ['rename_grouped.bat', 'rename_associated.txt'];
    const sourceFolder = './plugins/rename/test/fixtures/renameable';
    const expectedFilenames = ['rename_grouped.bat', 'rename_grouped.bin', 'rename_grouped.bmp',
      'rename_associated.tar', 'rename_associated.tax', 'rename_associated.txt'];

    plugin.renamePaths(sourceFolder, filenames, futureFilenames, { renameAssociated: true })
      .then((result) => {
        assert.plan(result.length * 2);
        const uniqueResult = new Set(result);
        expectedFilenames.forEach((filename) => {
          const fullPath = path.resolve(__dirname, '../../../', sourceFolder, filename);
          assert.ok(uniqueResult.has(fullPath), 'Full path matches future path');

          exist.pathExists(`${sourceFolder}/${filename}`)
            .then(() => assert.pass(`Associated ${filename} file renamed with associated`))
            .catch(error => assert.fail(`${filename} file does not exist ${error}`));
        });
      })
      .catch(error => assert.fail(`Rename failed (${error})`) && assert.end());
  });

  describe.test('* Restore associated is true so six filenames', { skip: false }, (assert) => {
    const filenames = ['rename_grouped.bat', 'rename_associated.txt'];
    const futureFilenames = ['bee.bat', 'tee.txt'];
    const sourceFolder = './plugins/rename/test/fixtures/renameable';
    const expectedFilenames = ['bee.bat', 'bee.bin', 'bee.bmp', 'tee.tar', 'tee.tax', 'tee.txt'];

    plugin.renamePaths(sourceFolder, filenames, futureFilenames, { renameAssociated: true })
      .then((result) => {
        assert.plan(result.length);
        const uniqueResult = new Set(result);
        expectedFilenames.forEach((filename) => {
          const fullPath = path.resolve(__dirname, '../../../', sourceFolder, filename);
          assert.ok(uniqueResult.has(fullPath), 'Full path matches future path');
        });
      })
      .catch(error => assert.fail(`Rename failed ${error}`) && assert.end());
  });
});

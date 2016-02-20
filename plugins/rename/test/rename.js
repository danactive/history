'use strict';
const test = require('tape');

/*
*     #######                       #
*     #       # #    # #####       # #    ####   ####   ####   ####  #   ##   ##### ###### #####
*     #       # ##   # #    #     #   #  #      #      #    # #    # #  #  #    #   #      #    #
*     #####   # # #  # #    #    #     #  ####   ####  #    # #      # #    #   #   #####  #    #
*     #       # #  # # #    #    #######      #      # #    # #      # ######   #   #      #    #
*     #       # #   ## #    #    #     # #    # #    # #    # #    # # #    #   #   #      #    #
*     #       # #    # #####     #     #  ####   ####   ####   ####  # #    #   #   ###### #####
*
*/
test('Find many associated relative filenames', (assert) => {
  const sourceFolder = './plugins/rename/test/fixtures/renameable/';
  const file = 'bee';
  const associatedFilenames = [`${file}.bat`, `${file}.bin`, `${file}.bmp`];
  const module = require('../lib/rename');

  module.findAssociated(sourceFolder, associatedFilenames[0])
    .then((filenames) => {
      if (filenames.length === 0) {
        assert.fail(`No filenames found`);
        assert.end();
      }
      assert.plan(filenames.length);
      filenames.forEach((filename, index) => {
        const associatedFilename = associatedFilenames[index];
        assert.ok(filename.indexOf(associatedFilename.substr(1)) !== -1,
          `Found associated filenames with path ${associatedFilename}`);
      });
    })
    .catch((error) => assert.fail(`Associated files is not found (${error})`));
});

test('Find many associated absolute filenames', (assert) => {
  const sourceFolder = require('app-root-path').resolve('./test/fixtures/renameable/');
  const file = 'bee';
  const associatedFilenames = [`${file}.bat`, `${file}.bin`, `${file}.bmp`];
  const module = require('../lib/rename');

  module.findAssociated(sourceFolder, associatedFilenames[0])
    .then((filenames) => {
      if (filenames.length === 0) {
        assert.fail(`No filenames found`);
        assert.end();
      }
      assert.plan(filenames.length);
      filenames.forEach((filename, index) => {
        const associatedFilename = associatedFilenames[index];
        assert.ok(filename.indexOf(associatedFilename.substr(1)) !== -1,
          `Found associated filenames with path ${associatedFilename}`);
      });
    })
    .catch((error) => assert.fail(`Associated files is not found (${error})`));
});

test('Find no associated filenames', (assert) => {
  const sourceFolder = './plugins/rename/test/fixtures/renameable/';
  const filename = 'FAKE';
  const associatedFilenames = [];
  const module = require('../lib/rename');

  assert.plan(1);
  module.findAssociated(sourceFolder, filename)
    .then((files) => assert.deepEqual(files, associatedFilenames, `Correctly found no files from fake path`))
    .catch((error) => assert.fail(`Associated files is not found (${error})`));
});

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
test('Reassign many associated absolute filenames', (assert) => {
  const filepath = require('app-root-path').resolve('./plugins/rename/test/fixtures/renameable/');
  const absoluteAssociatedFilenames = [`${filepath}bee.bat`, `${filepath}bee.bin`, `${filepath}bee.bmp`];
  const futureFile = 'future';
  const futureAssociatedFilenames = [
    `${filepath}${futureFile}.bat`,
    `${filepath}${futureFile}.bin`,
    `${filepath}${futureFile}.bmp`,
  ];
  const module = require('../lib/rename');

  assert.plan(1);
  module.reassignAssociated(absoluteAssociatedFilenames, futureFile)
    .then((futureFilenames) => {
      assert.deepEqual(futureAssociatedFilenames, futureFilenames, 'Reassigned filenames match');
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
test('Rename real source folder', (assert) => {
  const filenames = ['cee.css', 'jay.js', 'el.log'];
  const futureFilenames = ['changed.css', 'renamed.js', 'temp.txt'];
  const sourceFolder = './plugins/rename/test/fixtures/renameable';
  const module = require('../lib/rename');

  assert.plan(1);
  module.renamePaths(sourceFolder, filenames, futureFilenames)
    .then(success => assert.equal(success, true, 'No errors'))
    .catch(error => assert.fail(`Rename failed ${error}`));
});

test('Restore real source folder', (assert) => {
  const filenames = ['changed.css', 'renamed.js', 'temp.txt'];
  const futureFilenames = ['cee.css', 'jay.js', 'el.log'];
  const sourceFolder = './plugins/rename/test/fixtures/renameable';
  const module = require('../lib/rename');

  assert.plan(1);
  module.renamePaths(sourceFolder, filenames, futureFilenames)
    .then(success => assert.equal(success, true, 'No errors'))
    .catch(error => assert.fail(`Rename failed ${error}`));
});

test('Caught fake source folder', (assert) => {
  const filenames = ['cee.css', 'jay.js', 'el.log'];
  const futureFilenames = ['changed.css', 'renamed.js', 'temp.txt'];
  const sourceFolder = './plugins/rename/test/fixtures/FAKE';
  const module = require('../lib/rename');

  assert.plan(1);
  module.renamePaths(sourceFolder, filenames, futureFilenames)
    .then(() => assert.fail('Code incorrectly found a fake folder'))
    .catch(() => assert.pass('Fake folder not found'));
});

test('Caught fake source filenames', (assert) => {
  const filenames = ['FAKEcee.css', 'FAKEjay.js', 'FAKEel.log'];
  const futureFilenames = ['changed.css', 'renamed.js', 'temp.txt'];
  const sourceFolder = './plugins/rename/test/fixtures/renameable';
  const module = require('../lib/rename');

  assert.plan(1);
  module.renamePaths(sourceFolder, filenames, futureFilenames)
    .then(() => assert.fail('Code incorrectly found a fake filename'))
    .catch(() => assert.pass('Fake filename not found'));
});

test('Rename associated is false so one filename', (assert) => {
  const filenames = ['bee.bat'];
  const futureFilenames = ['rename_grouped.bat'];
  const sourceFolder = './plugins/rename/test/fixtures/renameable';
  const module = require('../lib/rename');

  module.renamePaths(sourceFolder, filenames, futureFilenames, { renameAssociated: false })
    .then(success => {
      assert.plan(3);
      assert.equal(success, true, 'No errors');
      const exist = require('../../exists/lib');
      exist.pathExists(`${sourceFolder}/bee.bin`)
        .then(() => assert.pass('Associated bee.bin file remains untouched'))
        .catch(error => assert.fail(`Bee.bin file does not exist ${error}`));
      exist.pathExists(`${sourceFolder}/bee.bmp`)
        .then(() => assert.pass('Associated bee.bmp file remains untouched'))
        .catch(error => assert.fail(`Bee.bmp file does not exist ${error}`));
    })
    .catch(error => assert.fail(`Rename failed ${error}`));
});

test('Restore associated is false so one filename', (assert) => {
  const filenames = ['rename_grouped.bat'];
  const futureFilenames = ['bee.bat'];
  const sourceFolder = './plugins/rename/test/fixtures/renameable';
  const module = require('../lib/rename');

  assert.plan(1);
  module.renamePaths(sourceFolder, filenames, futureFilenames, { renameAssociated: false })
    .then(success => assert.equal(success, true, 'No errors'))
    .catch(error => assert.fail(`Rename failed ${error}`));
});

test('Rename associated is true so six filenames', (assert) => {
  const filenames = ['bee.bat', 'tee.txt'];
  const futureFilenames = ['rename_grouped.bat', 'rename_associated.txt'];
  const sourceFolder = './plugins/rename/test/fixtures/renameable';
  const module = require('../lib/rename');

  module.renamePaths(sourceFolder, filenames, futureFilenames, { renameAssociated: true })
    .then((success) => {
      assert.plan(7);
      assert.equal(success, true, 'No errors');
      const exist = require('../../exists/lib');
      exist.pathExists(`${sourceFolder}/rename_grouped.bat`)
        .then(() => assert.pass('Associated rename_grouped.bat file renamed with associated'))
        .catch(error => assert.fail(`Rename_grouped.bin file does not exist ${error}`));
      exist.pathExists(`${sourceFolder}/rename_grouped.bin`)
        .then(() => assert.pass('Associated rename_grouped.bin file renamed with associated'))
        .catch(error => assert.fail(`Rename_grouped.bin file does not exist ${error}`));
      exist.pathExists(`${sourceFolder}/rename_grouped.bmp`)
        .then(() => assert.pass('Associated rename_grouped.bmp file remains with associated'))
        .catch(error => assert.fail(`Rename_grouped.bmp file does not exist ${error}`));
      exist.pathExists(`${sourceFolder}/rename_associated.txt`)
        .then(() => assert.pass('Associated rename_associated.txt file renamed with associated'))
        .catch(error => assert.fail(`Rename_associated.tar file does not exist ${error}`));
      exist.pathExists(`${sourceFolder}/rename_associated.tar`)
        .then(() => assert.pass('Associated rename_associated.tar file renamed with associated'))
        .catch(error => assert.fail(`Rename_associated.tar file does not exist ${error}`));
      exist.pathExists(`${sourceFolder}/rename_associated.tar`)
        .then(() => assert.pass('Associated rename_associated.tar file remains with associated'))
        .catch(error => assert.fail(`Rename_associated.tar file does not exist ${error}`));
    })
    .catch((error) => {
      assert.fail(`Rename failed (${error})`);
    });
});

test('Restore associated is true so six filenames', (assert) => {
  const filenames = ['rename_grouped.bat', 'rename_associated.txt'];
  const futureFilenames = ['bee.bat', 'tee.txt'];
  const sourceFolder = './plugins/rename/test/fixtures/renameable';
  const module = require('../lib/rename');

  assert.plan(1);
  module.renamePaths(sourceFolder, filenames, futureFilenames, { renameAssociated: true })
    .then((success) => assert.equal(success, true, 'No errors'))
    .catch((error) => assert.fail(`Rename failed ${error}`));
});

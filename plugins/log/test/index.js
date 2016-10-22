const tape = require('tape-catch');

tape('Log', { skip: false }, (describe) => {
  const lib = require('../lib');

  const moduleName = 'test';

  describe.test('* Operational message', (assert) => {
    const testMessage = 'plugin-test-1';
    const logger = lib(moduleName, {
      callback: (message) => {
        assert.ok(message.indexOf(testMessage) > -1, 'Message found');
        assert.ok(message.indexOf(moduleName) > -1, 'Module name found');
        assert.end();
      },
    });

    logger.operational(testMessage);
  });

  describe.test('* Debug message', (assert) => {
    const testMessage = 'plugin-test-2';
    const logger = lib(moduleName, {
      callback: (message) => {
        assert.ok(message.indexOf(testMessage) > -1, 'Message found');
        assert.ok(message.indexOf(moduleName) > -1, 'Module name found');
        assert.end();
      },
    });

    logger.debug(testMessage);
  });

  describe.test('* Panic message', (assert) => {
    const testMessage = 'plugin-test-3';
    const logger = lib(moduleName, {
      callback: (message) => {
        assert.ok(message.indexOf(testMessage) > -1, 'Message found');
        assert.ok(message.indexOf(moduleName) > -1, 'Module name found');
        assert.end();
      },
    });

    logger.panic(testMessage);
  });

  describe.test('* Console logs', (assert) => {
    const testMessage = 'plugin-test-4';
    const logger = lib(moduleName);

    assert.ok(logger.operational(`${testMessage} operational`), 'Truthy return value');
    assert.ok(logger.debug(`${testMessage} debug`), 'Truthy return value');
    assert.ok(logger.panic(`${testMessage} panic`), 'Truthy return value');
    assert.end();
  });
});

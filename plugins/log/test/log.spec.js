const tape = require('tape-catch');

tape('Log', { skip: false }, (describe) => {
  const lib = require('../lib/log');

  const moduleName = 'test';
  const createCallbackHandler = (assert, testMessage) => (message) => {
    assert.ok(message.indexOf(testMessage) > -1, 'Message found');
    assert.ok(message.indexOf(moduleName) > -1, 'Module name found');
    assert.end();
  };

  describe.test('* Operational message', (assert) => {
    const testMessage = 'plugin-test-operational';
    const logger = lib(moduleName, {
      callback: createCallbackHandler(assert, testMessage)
    });

    logger.operational(testMessage);
  });

  describe.test('* Debug message', (assert) => {
    const testMessage = 'plugin-test-debug';
    const logger = lib(moduleName, {
      callback: createCallbackHandler(assert, testMessage)
    });

    logger.debug(testMessage);
  });

  describe.test('* Panic message', (assert) => {
    const testMessage = 'plugin-test-panic';
    const logger = lib(moduleName, {
      callback: createCallbackHandler(assert, testMessage)
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

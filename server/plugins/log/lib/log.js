/* global module, process */

function createLogger(moduleName, options = {}) {
  const print = message => ((options.callback) ? options.callback(message) : process.stdout.write(`${message}\n`));
  const output = message => print(`${moduleName}: ${message}`);

  return {
    debug: message => output(message),
    operational: message => output(message),
    panic: message => output(message),
  };
}

module.exports = { createLogger };

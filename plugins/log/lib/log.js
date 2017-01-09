module.exports = function log(moduleName, options = {}) {
  const print = (message) => {
    if (options.callback) {
      options.callback(message);
    } else {
      process.stdout.write(`${message}\n`);
    }
    return true;
  };
  const output = message => print(`${moduleName}: ${message}`);

  return {
    debug: message => output(message),
    operational: message => output(message),
    panic: message => output(message),
  };
};

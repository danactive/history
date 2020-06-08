const argv = require('./argv');
const config = require('../../config.json');

module.exports = parseInt(argv.port || process.env.PORT || config.uiPort, 10);

/*global module*/

/**
* Error handling for JSON output
*
* @method setError
* @param {object} [error] Node.js create error object (may be Boom wrapped)
* @param {string} [message] Description of error
* @param {object} [data] Additional meta data of error
* @param {string} [serviceAddress] Service API endpoint with query string parameters
* @return {object} Returns JSON of error details
*/
function _setError(error, message, data, serviceAddress) {
	'use strict';
	var boom = require("boom"),
		boomError,
		hasError = (error !== undefined && error !== null),
		out = {},
		statusCode = 500;
	data = data || {"message": message};

	if (hasError && error.meta && error.meta.error.isBoom) {
		return error;
	}

	boomError = (hasError) ? boom.wrap(error, statusCode, message) : boom.create(statusCode, message, data);

	out.meta = {
		"error": boomError,
		"version": require("../package.json").version
	};
	if (serviceAddress) {
		out.meta.serviceAddress = serviceAddress;
	}
	return out;
}

module.exports = {
	"setError": _setError
};
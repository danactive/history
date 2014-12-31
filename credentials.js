/*global module*/
"use strict";
var credentials = {
		"flickr": {
			"api_key": '671aab1520e2cb69e08dd36a5f40213b',
			"secret": '99a4607019e61826'
		}
	},
	isNode = (typeof module !== 'undefined' && typeof module.exports !== 'undefined');
if (isNode) {
	module.exports.flickr = {
		"api_key": credentials.flickr.api_key
	};
}
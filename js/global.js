/*global window*/
var ajaxError = function(jqXHR, textStatus, errorThrown) { debugger; /* run as localhost */ },
util = {
	dateObjFormat: function (date) {
		// in - JS date object
		// out - yyyy-mm-dd
		var yyyy = date.getFullYear().toString(),
		m = (date.getMonth() + 1).toString(),
		mm = (m.length === 1) ? '0' + m : m,
		d = date.getDate().toString(),
		dd = (d.length === 1) ? '0' + d : d;

		return [yyyy, mm, dd].join('-');
	},
	queryObj: function () { // usage var myParam = queryObj()["myParam"];
		var result = {}, keyValuePairs = window.location.search.slice(1).split('&');

		keyValuePairs.forEach(function(keyValuePair) {
			keyValuePair = keyValuePair.split('=');
			result[keyValuePair[0]] = keyValuePair[1] || '';
		});

		return result;
	}
};

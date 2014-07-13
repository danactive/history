/*global ajaxError, jQuery, JSON, requireArg, util */
function xml(options) {
	var album = requireArg({"args": options, "name": "album", "type": "string"}),
		callback = requireArg({"args": options, "name": "callback", "type": "function"}),
		gallery = requireArg({"args": options, "name": "gallery", "type": "string"});

	jQuery.get('../gallery-' + gallery + '/album_' + album + '.xml')
		.error(ajaxError)
		.success(function (response) {
			var json = jQuery.parseJSON(util.xml.convertToJsonString(response,''));
			callback({
				"jsonPretty": JSON.stringify(json, undefined, 2),
				"xmlPretty": util.xml.formatPretty(util.xml.convertToString(response)),
				"json": json,
				"xml": response
			});
		});

	return this;
}
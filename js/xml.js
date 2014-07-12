/*global ajaxError, jQuery, JSON, fncFormatXml, requireArg, xmlToString, xml2json */
function xml(options) {
	var album = requireArg({"args": options, "name": "album", "type": "string"}),
		callback = requireArg({"args": options, "name": "callback", "type": "function"}),
		gallery = requireArg({"args": options, "name": "gallery", "type": "string"});

	jQuery.get('../gallery-' + gallery + '/album_' + album + '.xml')
		.error(ajaxError)
		.success(function (response) {
			var json = jQuery.parseJSON(xml2json(response,''));
			callback({
				"jsonPretty": JSON.stringify(json, undefined, 2),
				"xmlPretty": fncFormatXml(xmlToString(response)),
				"json": json,
				"xml": response
			});
		});
}
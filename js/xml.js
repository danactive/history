/*global ajaxError, jQuery, JSON, requireArg, xml2json*/
function xml(options) {
	var album = requireArg({"args": options, "name": "album", "type": "string"}),
		callback = requireArg({"args": options, "name": "callback", "type": "function"}),
		gallery = requireArg({"args": options, "name": "gallery", "type": "string"});

	jQuery.get('../gallery-' + gallery + '/album_' + album + '.xml')
		.error(ajaxError)
		.success(function (response) {
			var json = jQuery.parseJSON(xml2json(response,''));
			callback({
				"jsonText": JSON.stringify(json),
				"xmlText": fncFormatXml(xmlToString(response)),
				"json": json,
				"xml": response
			});
		});
}
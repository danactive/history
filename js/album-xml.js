/*global __dirname, ajaxError, console, jQuery, require, xml2json, window */
var _error = {
	"missingArg": "Missing required argument",
	"missingArgAlbum": "Missing required argument album filename",
	"missingArgGallery": "Missing required argument gallery name"
};

function _getAlbumXmlAsJson(arg) {
	"use strict";
	var xmlJsonClass;
	if (arg === undefined) {
		throw new ReferenceError(_error.missingArg);
	}
	if (arg.album === undefined) {
		throw new ReferenceError(_error.missingArgAlbum);
	}
	if (arg.gallery === undefined) {
		throw new ReferenceError(_error.missingArgGallery);
	}

	function comparePhotoFilename (xml, file) {
		var idLoop = window.prompt("Starting XML photo ID?", 1),
			xmlOutput = [];
		jQuery.each(xml, function (key, value) {
			if (xml[key] !== file[key]) {
				console.log(xml[key] + " XML filename missing from file. Delete the XML photo element");
			}
		});
		jQuery.each(file, function (key, value) {
			if (xml[key] !== file[key]) {
				xmlOutput.push('<photo id="' + idLoop + '"><filename>' + file[key] + '</filename></photo>');
				idLoop++;
				console.log(file[key] + " File filename missing from XML. Add XML elements to XML document");
			}
		});
		jQuery("<textarea>").val(xmlOutput.join("")).appendTo("body");
	}

	function ConvertXmlToJson(xmlData) {
		var jsonAlbum = jQuery.parseJSON(xml2json(xmlData,'')),
			xml = {};

		jQuery.each(jsonAlbum.album.photo, function (x, photo) {
			var key = photo.filename.replace(/-/g,"");
			key = key.split(".");
			xml[key[0]] = photo.filename;
		});

		jQuery.ajax({
			"url": '/api/walk-path?folder=gallery-' + arg.gallery + '/media/originals/2013/',
			"success": function (response) {
				var file = {};
				jQuery.each(response.items, function (x, photo) {
					var key = photo.name.replace(/-/g,"");
					file[key] = photo.name+photo.ext;
				});

				comparePhotoFilename(xml, file);
			},
			"error": ajaxError
		});
	}

	jQuery.get('../../gallery-' + arg.gallery + '/album_' + arg.album + '.xml')
			.error(ajaxError)
			.success(ConvertXmlToJson);
}

(function () {
	_getAlbumXmlAsJson({
		"gallery": 'dan',
		"album": 'mexico2013'
	});
})();
/*global $, album, util*/
/*exported SaveToJson*/
'use strict';
var schema = {
	"filename": "filename",
	"city": "photo_city",
	"location": "photo_loc",
	"caption": "thumb_caption",
	"description": "photo_desc",
	"ref_name": "ref.name",
	"ref_src": "ref.source",
	"geo_lat": "geo.lat",
	"geo_lon": "geo.lon"
};
function SaveToJson() {
	function examineThumbs(i, thumb) {
		var $field,
			fieldValue,
			jsonPhoto = $(thumb).data('photo') || {}, // live reference
			xmlNameArray;
		$.each(schema, function(elementId, xPath) {
			$field = $('#'+elementId);
			if ($field.prop('disabled')) { // do NOT generate if field disabled
				return true; // continue to next selected thumb
			}
			fieldValue = $field.val();
			fieldValue = fieldValue.replace(/&/g, "&amp;"); // XML safe
			if (fieldValue === "") {
				fieldValue = undefined;
			}
			
			if (xPath.indexOf('.') === -1) {
				jsonPhoto[xPath] = fieldValue;
			} else { // dot syntax found
				xmlNameArray = xPath.split('.');
				if (!jsonPhoto[xmlNameArray[0]]) { // create object if missing from JSON
					jsonPhoto[xmlNameArray[0]] = {};
				}
				jsonPhoto[xmlNameArray[0]][xmlNameArray[1]] = fieldValue;
				if (fieldValue === undefined) {
					delete jsonPhoto[xmlNameArray[0]][xmlNameArray[1]];
				}
				if (JSON.stringify(jsonPhoto[xmlNameArray[0]]) === JSON.stringify({})) {
					delete jsonPhoto[xmlNameArray[0]];
				}
			}
		});
	}
	$('#listPhotos .selected').each(examineThumbs);
	$('#rawAlbumJson').val(JSON.stringify(album.json)); // display in textarea
	$('#rawAlbumJsonToXml').val(util.xml.formatPretty(util.json.convertToXml(album.json, "")));
}
/*global $, flickr, util*/
"use strict";
var displayPhotos = function (response) {
		var origPath = "",
			$galleryBox = $("#galleryBox"),
			html = "",
			thumbPath = "";

		$.each(response.photos.photo, function (x, photo) {
			origPath = "https://farm" + photo.farm + ".staticflickr.com/" + photo.server + "/" + photo.id + "_" + photo.secret + "_b.jpg";
			thumbPath = "https://farm" + photo.farm + ".staticflickr.com/" + photo.server + "/" + photo.id + "_" + photo.secret + "_t.jpg";
			html = '<a href="' + origPath + '"><img alt="' + photo.title + '" src="' + thumbPath + '"></a>';
			$galleryBox.append(html);
		});
		$galleryBox.justifiedGallery();
	},
	flickrArgs = {
		"method": 'flickr.photos.search',
		"api_key": flickr.api_key,
		"format": 'json'
	},
	flickrUrl = "https://api.flickr.com/services/rest/",
	getPhotos = function (lat, lon) {
		if (lat === undefined || lon === undefined) {
			return;
		}
		flickrArgs.lat = lat;
		flickrArgs.lon = lon;

		$.ajax({
			"url": flickrUrl,
			"data": flickrArgs,
			"dataType": 'jsonp', // tell $ our expected response format JSON with padding
			"jsonpCallback": "jsonFlickrApi", //execute Flickr function that contains the response JSON
			"success": displayPhotos
		});
	},
	qs = util.queryObj();
getPhotos(qs["lat"], qs["lon"]);
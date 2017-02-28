/*global $, instagram, util*/
"use strict";

var ig = require('instagram-node').instagram();

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
	instaArgs = {
		"method": 'locations/search',
		"client_id": instagram.client_id,
		"format": 'json'
	},
	instaUrl = "https://api.instagram.com/v1/",
	getPhotos = function (lat, lon) {
		if (lat === undefined || lon === undefined) {
			return;
		}
		instaArgs.lat = lat;
		instaArgs.lon = lon;

		$.ajax({
			"url": instaUrl,
			"data": instaArgs,
			"dataType": 'jsonp', // tell $ our expected response format JSON with padding
			"jsonpCallback": "jsonFlickrApi", //execute Flickr function that contains the response JSON
			"success": displayPhotos
		});
	},
	qs = util.queryObj();
  getPhotos(qs["lat"], qs["lon"]);

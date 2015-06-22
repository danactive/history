/*global ColorThief, jQuery, Map, Xml, window*/
/*exported fOpenWin, fnMedium, triggerLightboxOpen*/
'use strict';
/* GALLERY */
jQuery.noConflict();
/* ALBUM */
var $albumBox = jQuery("#albumBox"),
	colorThief,
	map,
	mapBoxId = 'mapBox',
	$mapBox = jQuery("#"+mapBoxId),
	meta = {
		"album": $albumBox.attr("data-album"),
		"gallery": $albumBox.attr("data-gallery")
	},
	xml;
function photoViewed() {
	/*jshint validthis:true */
	var dominateColour,
		index,
		photoImage = jQuery("img.cboxPhoto").get(0),
		$thumbBox,
		$thumbImage = jQuery(this);
	dominateColour = colorThief.getColor(photoImage);
	$thumbBox = $thumbImage.parents('.liAlbumPhoto');

	$thumbBox.addClass('imgViewed'); //  change thumb to white

	// lightbox
	jQuery("#cboxOverlay").css("background-color", "rgb(" + dominateColour[0] + "," + dominateColour[1] + "," + dominateColour[2] + ")"); // change background colour
	jQuery("#cboxTitle").hide();
	jQuery("#cboxLoadedContent").append(jQuery("#cboxTitle").html()).css({color: jQuery("#cboxTitle").css("color")});
	jQuery.fn.colorbox.resize();
	if (map) {
		index = parseInt($thumbBox.attr("id").replace("photo", ""), 10);
		map.pin.go(index);
	}
}
jQuery(function() {
	colorThief = new ColorThief();
	jQuery('#albumBox a').colorbox({
		"right": '25%',
		"onComplete": photoViewed,
		"preloading": true,
		"title": function () {
			if (this && this.dataset && this.dataset.caption) {
				return this.dataset.caption;
			} else {
				return jQuery(this).data('caption');
			}
		},
		"transition": 'none'
	});
});
/* MAP */
Array.max = function( array ){
	return Math.max.apply( Math, array );
};
Array.min = function( array ){
	return Math.min.apply( Math, array );
};
function fOpenWin(sURL, iW, iH, sName, bScrollBars) {
	var iXPos = 0, iYPos = 15, sArgs, oWin, iBrowserHeight;
	if (window.outerWidth) { /* outerWidth for frameset use; otherwise innerWidth works; (NN4, NN6, O7-O9) */
		iXPos = (window.outerWidth - iW) / 2;
		iYPos = (window.outerHeight - iH) / 2;
		iXPos += window.screenX;
		iYPos += window.screenY;
	} else { /* screen width (1 600) not used because I want centred in window on screen */
		iXPos = (window.document.body.clientWidth - iW) / 2; /* [current browser chrome width (800) - new window width (400)] / 2 = 200 on each side */
		iBrowserHeight = (window.document.compatMode === "CSS1Compat") ? window.document.documentElement.clientHeight : window.document.body.clientHeight;
		iYPos = (iBrowserHeight - iH) / 2;
		iXPos += window.screenLeft;
		iYPos += window.screenTop; /* current position of window (400) + iXPos (200) = 600 is left pos */
	} /* left space (600) + new width (400) + right space (600) = screen res (1 600) */

	if (typeof bScrollBars === 'boolean') {
		bScrollBars = (bScrollBars === true) ? 'yes' : 'no';
	} else {
		bScrollBars = 'yes'; /* not defined set to default */
	}

	sArgs = 'width=' + iW + ',height=' + iH + ',resizable=yes,scrollbars=' + bScrollBars + ',status=yes,screenx=' + iXPos + ',screeny=' + iYPos + ',left=' + iXPos + ',top=' + iYPos;
	if (!sName) {
		sName = 'popup';
	}
	oWin = window.open(sURL, sName, sArgs);

	if (oWin !== null && oWin !== undefined) {
		if (oWin.opener === null || oWin.opener === undefined) { /* give orphan child window this parent */
			oWin.opener = window.self;
		}
		oWin.focus();
	}
}
function fnMedium(strType) { // create class
	/*jshint validthis:true */
	this.type = strType;
	this.id = 0;
	this.name = "";
	this.filename = "";
	this.caption = "";
	this.src = "";
	this.getType = function() { return this.type; };
	this.getId = function() { return this.id; };
	this.getName = function() { return this.name; };
	this.getFilename = function() { return this.filename; };
	this.getCaption = function() { return this.caption; };
	this.getSrc = function() { return this.src; };
}
function triggerLightboxOpen(objMapLink, strPhotoId) {
	jQuery('li#photo' + strPhotoId + '')
		.addClass('imgViewed') //  change thumb to white
		.find('a')
		.trigger('click');
}
function displayAlbum (response) {
	//var intZoom = parseInt(response.json.album.album_meta.geo.google_zoom, 10);

	map = new Map({
		"album": meta.album,
		"gallery": meta.gallery,
		"events": {
			"highlightPlottedPin": function () {
				$mapBox.removeClass("subtle");
			},
			"highlightOmittedPin": function () {
				$mapBox.addClass("subtle");	
			}
		},
		"map": {
			"centre": [0, 0],
			"containerId": mapBoxId,
			"itemCount": response.json.album.item.length,
		}
	});

	if (response.json.album.item) {
		jQuery.each(response.json.album.item, function(i, item) {
			var addOptions = {},
				filename = item.filename || "";

			if (typeof filename === "object") {
				filename = item.filename[0];
			}
			addOptions.html = "<div class='thumbPlaceholder'><img src='" + map.util.filenamePath(filename, true) + ".jpg'></div><div class='caption'>" + item.thumb_caption + "</div>";
			addOptions.id = filename || i;
			addOptions.index = parseInt(item.sort, 10);
			
			if (item.geo) {
				addOptions.coordinates = [item.geo.lon, item.geo.lat];
			}
			
			map.pin.add(addOptions);
		}); //close each
	}
} // close displayAlbum

jQuery("#linkMap").click(function () {
	xml = new Xml({"gallery": meta.gallery, "album": meta.album, "callback": displayAlbum});

	jQuery("body").addClass("splitMode");
	$mapBox.removeClass("hide");
});
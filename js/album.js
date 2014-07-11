/*global jQuery*/

/* GALLERY */
jQuery.noConflict();
/* ALBUM */
var colorThief;
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
function fMap(strAlbumName) {
	var arrBubbles = [], arrLat = [], arrLon = [], arrMedia = [], intMediumCount = 0;
	var themap = jQuery('<div id="mapBox"></div>').insertBefore('#albumBox'); // create a div to host the map
	jQuery("#albumBox").addClass("splitMode");
	var mapstraction = new mxn.Mapstraction('mapBox', strMapEngine); // initialise the map with your choice of API
	
	jQuery.ajax({
		type: "GET",
		url: 'album_' + strAlbumName + '.xml',
		dataType: "xml",
		timeout: 1000,
		error: function() { window.alert('Error loading XML document'); },
		success: function(objXml) {
			if (strMapEngine === 'google') {
				intZoom = parseInt(jQuery('album_meta>geo>google_zoom', objXml).text(), 10);
			} else {
				intZoom = parseInt(jQuery('album_meta>geo>google_zoom', objXml).text(), 10); // currently Google exclusive
			}

			// build MARKER for photo
			jQuery('photo>geo', objXml).each(function() {
				var objTagGeo = jQuery(this);
				var objTagMedium = objTagGeo.parent();
				var strCaption = jQuery('photo_loc', objTagMedium).text();
				if (strCaption === '' || strCaption == null) {
					strCaption = jQuery('thumb_caption', objTagMedium).text();
				}
				var strId = jQuery('photo_id', objTagMedium).text(); // old node
				if (strId == '' || strId == null)
					strId = jQuery(objTagMedium).attr('id'); // new attr

				var objMedium = new fnMedium('photo');
				objMedium.id = strId;
				objMedium.name = jQuery('name', objTagMedium).text();
				objMedium.src = jQuery('source', objTagMedium).text();
				objMedium.filename = jQuery('filename', objTagMedium).text();
				objMedium.caption = strCaption;

				arrLat.push(jQuery('lat', objTagGeo).text()); arrLon.push(jQuery('lon', objTagGeo).text()); // set latitude and longitude in array for centring map
				// lat and lon used for sorting markers; marker type, photo filename, photo id for lightbox ref, lightbox caption
				arrBubbles.push(jQuery('lat', objTagGeo).text() + '|^|' + jQuery('lon', objTagGeo).text() + '|^|' + intMediumCount);
				arrMedia.push(objMedium);
				intMediumCount += 1;
			}); //close each(

			// build MARKER for link
			jQuery('link>geo', objXml).each(function() {
				var objTagGeo = jQuery(this);
				var objTagMedium = objTagGeo.parent();
				var strId = jQuery('photo_id', objTagMedium).text(); // old node
				if (strId == '' || strId == null)
					strId = jQuery(objTagMedium).attr('id'); // new attr

				var objMedium = new fnMedium('link');
				objMedium.id = strId;
				objMedium.name = jQuery('name', objTagMedium).text();
				objMedium.src = jQuery('source', objTagMedium).text();

				arrLat.push(jQuery('lat', objTagGeo).text()); arrLon.push(jQuery('lon', objTagGeo).text()); // set latitude and longitude in array for centring map
				// lat and lon used for sorting markers; marker type, wikipedia article name
				arrBubbles.push(jQuery('lat', objTagGeo).text() + '|^|' + jQuery('lon', objTagGeo).text() + '|^|' + intMediumCount);
				arrMedia.push(objMedium);
				intMediumCount += 1;
			}); //close each(

			// build MARKER for video
			jQuery('video>geo', objXml).each(function() {
				var objTagGeo = jQuery(this);
				var objTagMedium = objTagGeo.parent();
				var strCaption = jQuery('photo_loc', objTagMedium).text();
				if (strCaption == '' || strCaption == null)
					strCaption = jQuery('thumb_caption', objTagMedium).text();
				var strId = jQuery('photo_id', objTagMedium).text(); // old node
				if (strId == '' || strId == null)
					strId = jQuery(objTagMedium).attr('id'); // new attr

				var objMedium = new fnMedium('video');
				objMedium.id = strId;
				objMedium.name = jQuery('name', objTagMedium).text();
				objMedium.src = jQuery('source', objTagMedium).text();
				objMedium.filename = jQuery('filename', objTagMedium).text();
				objMedium.caption = strCaption;

				arrLat.push(jQuery('lat', objTagGeo).text()); arrLon.push(jQuery('lon', objTagGeo).text()); // set latitude and longitude in array for centring map
				// lat and lon used for sorting markers; marker type, wikipedia article name
				arrBubbles.push(jQuery('lat', objTagGeo).text() + '|^|' + jQuery('lon', objTagGeo).text() + '|^|' + intMediumCount);
				arrMedia.push(objMedium);
				intMediumCount += 1;
			}); //close each(

			arrBubbles.sort();

			// start loop; output markers
			var intPrevLat = '', intPrevLon = '';
			for (i = 0; i <= arrBubbles.length; i++) {
				if (i != arrBubbles.length) arrBubble = arrBubbles[i].split('|^|');
				// local var from array
				_strLat = arrBubble[0]; _strLon = arrBubble[1];
				_intMediumCount = arrBubble[2];
				_strType = arrMedia[_intMediumCount].getType();
				_strId = arrMedia[_intMediumCount].getId();
				_strName = arrMedia[_intMediumCount].getName(); _strSource = arrMedia[_intMediumCount].getSrc();
				_strFilename = arrMedia[_intMediumCount].getFilename(); _strCaption = arrMedia[_intMediumCount].getCaption();

				if (intPrevLat != _strLat || intPrevLon != _strLon || i == 0 || i == arrBubbles.length) { // open/close bubble
					if (i != 0 || i == arrBubbles.length) {
						strBubble += '</div>';
						marker.setInfoBubble(strBubble);
						mapstraction.addMarker(marker);
						marker.openBubble();
					}

					if (i != arrBubbles.length) { // open bubble
						intPrevLat = _strLat; intPrevLon = _strLon;

						var marker = new mxn.Marker(new mxn.LatLonPoint(_strLat, _strLon));
						strBubble = '<div id="mapBoxBubble">';
					}
				}
				if (intPrevLat == _strLat && intPrevLon == _strLon && i != arrBubbles.length) { // fill bubble
					intPrevLat = _strLat; intPrevLon = _strLon; // update prev coords

					if (_strName != '') {
						if (_strSource === 'wikipedia') {
							strDivExtRef = '<div><a href="javascript:;" onclick="fOpenWin(this.title,1000,900);" title="http://en.wikipedia.org/wiki/' + _strName + '">Popup Wikipedia</a></div>';
						} else if (_strSource === 'google') {
							strDivExtRef = '<div><a href="javascript:;" onclick="fOpenWin(this.title,1000,900);" title="http://www.google.com/search?q=' + _strName + '">Popup Google</a></div>';
						} else if (_strSource === 'facebook') {
							strDivExtRef = '<div><a href="javascript:;" onclick="fOpenWin(this.title,1000,900);" title="https://www.facebook.com/' + _strName + '">Popup Facebook</a></div>';
						} else if (_strSource === "") {
							strDivExtRef = '<div><a href="javascript:;" onclick="fOpenWin(this.title,1000,900);" title="' + _strName + '">Popup Web</a></div>';
						}
					} else {
						strDivExtRef = '';
					}

					if (_strType == 'photo') {
						intYear = _strFilename.substring(0, 4);
						strBubble += '<div class="mapBoxThumb"><a href="javascript:;" onclick="triggerLightboxOpen(this,\'' + _strId + '\');"><img src="media/thumbs/' + intYear + '/' + _strFilename + '" /></a></div><div class="mapBoxCaption">' + _strCaption + '</div>' + strDivExtRef;
					} else if (_strType == 'link') {
						strBubble += '<div class="mapBoxThumb"></div><div class="mapBoxCaption">' + _strName + '</div>' + strDivExtRef;
					} else if (_strType == 'video') {
						intYear = _strFilename.substring(0, 4);
						_strFilename = _strFilename.substr(0, _strFilename.indexOf('.')) + '.jpg'; // replace AVI with JPG
						strBubble += '<div class="mapBoxThumb"><a href="javascript:;" onclick="triggerLightboxOpen(this,\'' + _strId + '\');"><img src="media/thumbs/' + intYear + '/' + _strFilename + '" /></a></div><div class="mapBoxCaption">Video: ' + _strCaption + '</div>' + strDivExtRef;
					}
				}
			} // end loop

			// display the map centered on a latitude and longitude (Google zoom levels)
			var pointCentre = new mxn.LatLonPoint((Array.max(arrLat) + Array.min(arrLat)) / 2, (Array.max(arrLon) + Array.min(arrLon)) / 2);

			mapstraction.setCenterAndZoom(pointCentre, intZoom);
			mapstraction.addControls({ zoom: 'large', map_type: true });
			mapstraction.setMapType(1); // Google 1 = Street, 2 Satellite
			mapstraction.enableScrollWheelZoom();
		} // close success
	}); //close ajax(
}
function fOpenWin(sURL, iW, iH, sName, bScrollBars) {
	v = 'v1.6.0 2006-11-04; like:; req:;';
	iXPos = 0, iYPos = 15;
	if (window.outerWidth) { /* outerWidth for frameset use; otherwise innerWidth works; (NN4, NN6, O7-O9) */
		iXPos = (window.outerWidth - iW) / 2;
		iYPos = (window.outerHeight - iH) / 2;
		iXPos += window.screenX; iYPos += window.screenY;
	} else { /* screen width (1 600) not used because I want centred in window on screen */
		iXPos = (document.body.clientWidth - iW) / 2; /* [current browser chrome width (800) - new window width (400)] / 2 = 200 on each side */
		iBrowserHeight = (document.compatMode == "CSS1Compat") ? document.documentElement.clientHeight : document.body.clientHeight;
		iYPos = (iBrowserHeight - iH) / 2;
		iXPos += window.screenLeft; iYPos += window.screenTop; /* current position of window (400) + iXPos (200) = 600 is left pos */
	} /* left space (600) + new width (400) + right space (600) = screen res (1 600) */

	if (typeof bScrollBars == 'boolean')
		bScrollBars = (bScrollBars == true) ? 'yes' : 'no';
	else
		bScrollBars = 'yes'; /* not defined set to default */

	sArgs = 'width=' + iW + ',height=' + iH + ',resizable=yes,scrollbars=' + bScrollBars + ',status=yes,screenx=' + iXPos + ',screeny=' + iYPos + ',left=' + iXPos + ',top=' + iYPos
	if (!sName) sName = 'popup';
	oWin = window.open(sURL, sName, sArgs);

	if (oWin != null) {
		if (oWin.opener == null) /* give orphan child window this parent */
			oWin.opener = self;
		oWin.focus();
	}
}
function fnMedium(strType) { // create class
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
function photoViewed() {
	var dominateColour,
		sourceImage = jQuery("img.cboxPhoto").get(0);
	dominateColour = colorThief.getColor(sourceImage);

	jQuery(this).parents('li').addClass('imgViewed'); //  change thumb to white

	// lightbox
	jQuery("#cboxOverlay").css("background-color", "rgb(" + dominateColour[0] + "," + dominateColour[1] + "," + dominateColour[2] + ")"); // change background colour
	jQuery("#cboxTitle").hide();
	jQuery("#cboxLoadedContent").append(jQuery("#cboxTitle").html()).css({color: jQuery("#cboxTitle").css("color")});
	jQuery.fn.colorbox.resize();
}
function triggerLightboxOpen(objMapLink, strPhotoId) {
	jQuery('li#photo' + strPhotoId + '')
		.addClass('imgViewed') //  change thumb to white
		.find('a')
		.trigger('click');
}
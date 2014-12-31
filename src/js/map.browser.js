/*global mxn, requireArg, window*/
/*exported Map*/
window.historyApp = {
	"current": {
		"itemIndex": 0
	},
	"lookup": {},
	"map": {},
	"previous": {
		"itemIndex": 0
	}
};

function MapProvider(options) {
	"use strict";

	function init() {
		var cache = window.historyApp,
			centrePoint = new mxn.LatLonPoint(options.centreCoordinates[1], options.centreCoordinates[0]);
		
		slippyMap = new mxn.Mapstraction(cache.map.containerId, "leaflet");
		slippyMap.setCenterAndZoom(centrePoint, options.zoom || 14);
		slippyMap.addControls({ zoom: 'large', map_type: true });
		slippyMap.setMapType(1); // 1 = Street, 2 Satellite
		slippyMap.enableScrollWheelZoom();
	}

	var me = this,
		slippyMap;

	me.pin = {};
	me.pin.add = function (args) {
		var pushpin = new mxn.Marker(new mxn.LatLonPoint(args.coordinates[1], args.coordinates[0]));
		pushpin.setInfoBubble(args.html);
		slippyMap.addMarker(pushpin);
		return pushpin;
	};

	me.pin.centre = function (pushpin) {
		var point = new mxn.LatLonPoint(pushpin.location.lat, pushpin.location.lon);
		slippyMap.setCenter(point);
	};

	me.pin.select = function (pushpin) {
		pushpin.openBubble();
	};

	me.pin.unselect = function (pushpin) {
		pushpin.closeBubble();
	};

	init();
}

function Map(options) {
	"use strict";

	function init() {
		cache.items = new Array(itemCount);
		cache.map.containerId = mapContainerId;
		if (options.map && options.map.zoom) {
			mapProviderOptions.zoom = options.map.zoom;
		}

		mapProvider = new MapProvider(mapProviderOptions);
	}
	function nextPrevPin(args) {
		var addOrSubtract = requireArg({"args": args, "name": "addOrSubtract", "type": "number"}),
			index,
			isCarouselBeginReached = (0 === cache.current.itemIndex),
			isCarouselEndReached = (cache.items.length - 1 === cache.current.itemIndex);

		index = cache.current.itemIndex + addOrSubtract;
		if (addOrSubtract === -1 && isCarouselBeginReached) {
			index = cache.items.length - 1;
		} else if (addOrSubtract === +1 && isCarouselEndReached) {
			index = 0;
		}

		me.pin.go(index);
	}

	var cache = window.historyApp,
		centreCoordinates = requireArg({"args": options.map, "name": "centre", "type": "array"}),
		itemCount = requireArg({"args": options.map, "name": "itemCount", "type": "number"}),
		galleryName = requireArg({"args": options, "name": "gallery", "type": "string"}),
		mapContainerId = requireArg({"args": options.map, "name": "containerId", "type": "string"}),
		mapProvider,
		mapProviderOptions = {
			"centreCoordinates": centreCoordinates
		},
		me = this;

	me.pin = {};
	me.pin.add = function (args) {
		var html = requireArg({"args": args, "name": "html", "type": "string"}),
			id = requireArg({"args": args, "name": "id", "type": "string"}),
			index = requireArg({"args": args, "name": "index", "type": "number"}),
			lookupOptions = {},
			pushpin;

		if (args.coordinates && args.coordinates.length) {
			pushpin = mapProvider.pin.add({
				"coordinates": args.coordinates,
				"html": html,
				"id": id
			});

			lookupOptions.pin = pushpin;
		}
		
		cache.lookup[id] = lookupOptions;
		cache.items[index] = id;
	};

	me.pin.next = function () {
		nextPrevPin({"addOrSubtract": +1});
	};

	me.pin.prev = function () {
		nextPrevPin({"addOrSubtract": -1});
	};

	me.pin.go = function (index) {
		var currentId,
			currentPushpin,
			previousId,
			previousPushpin;

		cache.previous.itemIndex = cache.current.itemIndex;
		previousId = cache.items[cache.previous.itemIndex];
		if (previousId !== undefined) {
			previousPushpin = cache.lookup[previousId].pin;
		}
		if (previousPushpin !== undefined) {
			mapProvider.pin.unselect(previousPushpin);
		}

		cache.current.itemIndex = index;

		currentId = cache.items[cache.current.itemIndex];
		currentPushpin = cache.lookup[currentId].pin;

		if (currentPushpin === undefined) {
			if (options.events.highlightOmittedPin) {
				options.events.highlightOmittedPin();
			}
			return;
		}

		if (options.events.highlightPlottedPin) {
			options.events.highlightPlottedPin();
		}

		mapProvider.pin.select(currentPushpin);
		mapProvider.pin.centre(currentPushpin);
	};

	me.util = {};
	me.util.filenamePath = function (filename, removeFileType) {
		var path,
			year = filename.substring(0, 4);
		path = "../gallery-" + galleryName + "/media/thumbs/" + year + "/" + filename;
		if (removeFileType === true) {
			path = path.replace(/\.[^/.]+$/, "");
		}
		return path;
	};

	init();

	return me;
}
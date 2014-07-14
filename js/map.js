/*global mxn, requireArg, window*/
window.historyApp = {
	"current": {
		"itemIndex": 0
	},
	"items": [],
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
		slippyMap.setCenterAndZoom(centrePoint, 10);
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

	function nextPrevPin(args) {
		var addOrSubtract = requireArg({"args": args, "name": "addOrSubtract", "type": "number"}),
			currentId,
			currentPushpin,
			isCarouselBeginReached = (0 === cache.current.itemIndex),
			isCarouselEndReached = (cache.items.length - 1 === cache.current.itemIndex),
			previousId,
			previousPushpin;

		cache.previous.itemIndex = cache.current.itemIndex;
		previousId = cache.items[cache.previous.itemIndex];
		previousPushpin = cache.lookup[previousId].pin;
		if (previousPushpin !== undefined) {
			mapProvider.pin.unselect(previousPushpin);
		}

		cache.current.itemIndex += addOrSubtract;
		if (addOrSubtract === -1 && isCarouselBeginReached) {
			cache.current.itemIndex = cache.items.length - 1;
		} else if (addOrSubtract === +1 && isCarouselEndReached) {
			cache.current.itemIndex = 0;
		}

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
	}

	var cache = window.historyApp,
		centreCoordinates = requireArg({"args": options.map, "name": "centre", "type": "array"}),
		galleryName = requireArg({"args": options, "name": "gallery", "type": "string"}),
		mapContainerId = requireArg({"args": options.map, "name": "containerId", "type": "string"}),
		mapProvider,
		me = this;

	cache.map.containerId = mapContainerId;

	mapProvider = new MapProvider({
		"centreCoordinates": centreCoordinates
	});

	me.pin = {};
	me.pin.add = function (args) {
		var html = requireArg({"args": args, "name": "html", "type": "string"}),
			id = requireArg({"args": args, "name": "id", "type": "string"}),
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
		cache.items.push(id);
	};

	me.pin.next = function () {
		nextPrevPin({"addOrSubtract": +1});
	};

	me.pin.prev = function () {
		nextPrevPin({"addOrSubtract": -1});
	};

	me.util = {};
	me.util.filenamePath = function (filename) {
		var year = filename.substring(0, 4);
		return "../gallery-" + galleryName + "/media/thumbs/" + year + "/" + filename;
	};

	return me;
}
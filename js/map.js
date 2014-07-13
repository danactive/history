/*global mxn, requireArg, window*/
window.historyApp = {
	"current": {
		"itemIndex": 0
	},
	"items": [],
	"lookup": {}
};

function MapProvider(options) {
	"use strict";

	function init() {
		var centrePoint = new mxn.LatLonPoint(options.centreCoordinates[1], options.centreCoordinates[0]);
		
		slippyMap = new mxn.Mapstraction(options.mapContainer, "leaflet");
		slippyMap.setCenterAndZoom(centrePoint, 10);
		slippyMap.addControls({ zoom: 'large', map_type: true });
		slippyMap.setMapType(1); // 1 = Street, 2 Satellite
		slippyMap.enableScrollWheelZoom();
	}

	var slippyMap;

	this.pin = {};
	this.pin.add = function (args) {
		var pushpin = new mxn.Marker(new mxn.LatLonPoint(args.coordinates[1], args.coordinates[0]));
		pushpin.setInfoBubble(args.id);
		slippyMap.addMarker(pushpin);
		return pushpin;
	};

	this.pin.select = function (pushpin) {
		pushpin.openBubble();
	};

	init();
}

function Map(options) {
	"use strict";

	var cache = window.historyApp,
		centreCoordinates = requireArg({"args": options, "name": "centre", "type": "array"}),
		mapContainer = requireArg({"args": options, "name": "container", "type": "string"}),
		mapProvider;

	mapProvider = new MapProvider({
		"centreCoordinates": centreCoordinates,
		"mapContainer": mapContainer
	});

	this.pin = {};
	this.pin.add = function (args) {
		var coordinates = requireArg({"args": args, "name": "coordinates", "type": "array"}),
			id = requireArg({"args": args, "name": "id", "type": "string"}),
			selected = requireArg({"args": args, "name": "selected", "type": "boolean"}),
			pushpin;

		pushpin = mapProvider.pin.add({
			"coordinates": coordinates,
			"id": id
		});
		
		cache.lookup[id] = { "pin": pushpin };
		cache.items.push(id);

		if (selected === true) {
			mapProvider.pin.select(pushpin);
		}
	};

	this.pin.next = function () {
		var carouselBeginAgain = (cache.items.length - 1 === cache.current.itemIndex),
			currentId;
		cache.current.itemIndex++;
		if (carouselBeginAgain) {
			cache.current.itemIndex = 0;
		}
		currentId = cache.items[cache.current.itemIndex];
		mapProvider.pin.select(cache.lookup[currentId].pin);
	};

	return this;
}
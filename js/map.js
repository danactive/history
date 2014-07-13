/*global mxn, requireArg, window*/
window.historyApp = {
	"current": {
		"locationIndex": 0
	},
	"map": {
		"location": []
	}
};

function Map(options) {
	"use strict";
	function init() {
		var centrePoint = new mxn.LatLonPoint(centreGeoCode[1], centreGeoCode[0]);
		
		slippyMap = new mxn.Mapstraction(mapContainer, mapProvider);
		slippyMap.setCenterAndZoom(centrePoint, 10);
		slippyMap.addControls({ zoom: 'large', map_type: true });
		slippyMap.setMapType(1); // 1 = Street, 2 Satellite
		slippyMap.enableScrollWheelZoom();
	}
	var cache = window.historyApp,
		centreGeoCode = requireArg({"args": options, "name": "centre", "type": "array"}),
		mapContainer = requireArg({"args": options, "name": "container", "type": "string"}),
		mapProvider = "leaflet",
		slippyMap;

	this.pin = {};
	this.pin.add = function (args) {
		var coordinates = requireArg({"args": args, "name": "coordinates", "type": "array"}),
			open = requireArg({"args": args, "name": "open", "type": "boolean"}),
			pushpin;

		pushpin = new mxn.Marker(new mxn.LatLonPoint(coordinates[1], coordinates[0]));
		pushpin.setInfoBubble(coordinates[1]);		
		slippyMap.addMarker(pushpin);

		cache.map.location.push({ "pin": pushpin });

		if (open === true) {
			pushpin.openBubble();
		}
	};
	this.pin.next = function () {
		var carouselBeginAgain = (cache.map.location.length - 1 === cache.current.locationIndex);
		cache.current.locationIndex++;
		if (carouselBeginAgain) {
			cache.current.locationIndex = 0;
		}
		cache.map.location[cache.current.locationIndex].pin.openBubble();
	};

	init();

	return this;
}
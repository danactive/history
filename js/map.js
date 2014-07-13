/*global mxn, requireArg, window*/
function map(options) {
	"use strict";
	function init() {
		var centrePoint = new mxn.LatLonPoint(centreGeoCode[1], centreGeoCode[0]);
		
		slippyMap = new mxn.Mapstraction(mapContainer, mapProvider);
		slippyMap.setCenterAndZoom(centrePoint, 10);
		slippyMap.addControls({ zoom: 'large', map_type: true });
		slippyMap.setMapType(1); // 1 = Street, 2 Satellite
		slippyMap.enableScrollWheelZoom();

		window.historyMap = {};
		window.historyMap.pins = [];
		window.historyMap.current = { "pinIndex": 0 };
	}
	var centreGeoCode = requireArg({"args": options, "name": "centre", "type": "array"}),
		mapContainer = requireArg({"args": options, "name": "container", "type": "string"}),
		mapProvider = "leaflet",
		slippyMap;

	this.pin = {};
	this.pin.add = function (args) {
		var coordinates = requireArg({"args": args, "name": "coordinates", "type": "array"}),
			marker = new mxn.Marker(new mxn.LatLonPoint(coordinates[1], coordinates[0])),
			open = requireArg({"args": args, "name": "open", "type": "boolean"});
		marker.setInfoBubble(coordinates[1]);
		window.historyMap.pins.push({ "mxn": marker });
		slippyMap.addMarker(marker);

		if (open === true) {
			marker.openBubble();
		}
	};
	this.pin.next = function () {
		if (window.historyMap.pins.length - 1 === window.historyMap.current.pinIndex) {
			window.historyMap.current.pinIndex = 0;
		} else {
			window.historyMap.current.pinIndex++;
		}
		window.historyMap.pins[window.historyMap.current.pinIndex].mxn.openBubble();
	};

	init();

	return this;
}
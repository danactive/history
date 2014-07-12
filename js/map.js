/*global window*/
function map(options) {
	"use strict";
	function init() {
		function loadModules(path) {
			var element = window.document.createElement("script");
			element.src = path;
			window.document.head.appendChild(element);
		}
		var hasMapstraction = (typeof window.mxn !== "undefined"),
			mapstractionFolder = "../lib/mxn-3.0.0-RC5/";
		
		if (hasMapstraction) {
			return;
		}
		
		switch (mapProvider) {
			case "leaflet":
				loadModules("http://cdn.leafletjs.com/leaflet-0.6.4/leaflet.js");
				loadModules(mapstractionFolder + "mxn.js");
				loadModules(mapstractionFolder + "mxn.core.js");
				loadModules(mapstractionFolder + "mxn.leaflet.core.js");
				break;
		}
	}
	function setupMap() {
		var centrePoint = new window.mxn.LatLonPoint(centreGeoCode[1], centreGeoCode[0]),
			mapstraction = new window.mxn.Mapstraction(mapContainer, mapProvider);

		mapstraction.setCenterAndZoom(centrePoint, 10);
		mapstraction.addControls({ zoom: 'large', map_type: true });
		mapstraction.setMapType(1); // 1 = Street, 2 Satellite
		mapstraction.enableScrollWheelZoom();
	}
	function requireArg(argName, type) {
		function testType() {
			switch (type) {
				case "array":
					if (typeof options[argName] === "object" && options[argName].length) {
						return;
					}
					break;
				case "string":
					if (typeof options[argName] === "string") {
						return;
					}
					break;
			}
			throw new TypeError("Type mismatch '" + argName + "' must be a '" + type + "';");
		}
		if (options[argName] === undefined || options[argName] === null) {
			throw new ReferenceError("Required argument '" + argName + "';");
		}
		testType();
		return options[argName];
	}
	var centreGeoCode = requireArg("centre", "array"),
		mapContainer = requireArg("container", "string"),
		mapProvider = "leaflet",
		mapstraction;

	init();
	window.setTimeout(setupMap, 1500);
}
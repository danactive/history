/* global document, mapboxgl, window */
function createMap(response) {
  const ICON_SQUARE_PX = 60;
  const hasGeo = item => item.geo;
  const schema20ToGeoJson = item => ({
    type: 'Feature',
    properties: {
      caption: item.caption,
      thumbPath: item.thumbPath,
    },
    geometry: {
      type: 'Point',
      coordinates: [item.geo.lon, item.geo.lat],
    },
  });
  const geojson = { type: 'FeatureCollection', features: [] };

  geojson.features = response.album.items.filter(hasGeo).map(schema20ToGeoJson);

  mapboxgl.accessToken = 'pk.eyJ1IjoiZGFuYWN0aXZlIiwiYSI6ImNpdmo0OGo2YTAxcGIyenBkZWZlN3Ewam4ifQ.npY0cY_HdHg1OB692HtcUw';
  const map = new mapboxgl.Map({
    container: 'mapBox', // container id
    style: 'mapbox://styles/mapbox/streets-v9', // stylesheet location
    zoom: response.album.meta.geo.googleZoom,
  });

  // add markers to map
  geojson.features.forEach((marker) => {
    // create a DOM element for the marker
    const el = document.createElement('div');
    el.className = 'marker';
    el.style.backgroundImage = `url(${marker.properties.thumbPath})`;
    el.style.width = `${ICON_SQUARE_PX}px`;
    el.style.height = `${ICON_SQUARE_PX}px`;

    el.addEventListener('click', () => {
      map.panTo(marker.geometry.coordinates);
    });

    // add marker to map
    new mapboxgl.Marker(el, { offset: [-ICON_SQUARE_PX / 2, -ICON_SQUARE_PX / 2] })
      .setLngLat(marker.geometry.coordinates)
      .addTo(map);
  });

  map.panTo(geojson.features[0].geometry.coordinates);
}

// If Node.js then export as public
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
  module.exports = {
    createMap,
  };
}

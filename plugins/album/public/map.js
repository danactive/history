/* global document, mapboxgl, window */
function createMap() {
  const geojson = {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        properties: {
          message: 'Foo',
          iconSize: [60, 60],
        },
        geometry: {
          type: 'Point',
          coordinates: [
            -66.324462890625,
            -16.024695711685304,
          ],
        },
      },
      {
        type: 'Feature',
        properties: {
          message: 'Bar',
          iconSize: [50, 50],
        },
        geometry: {
          type: 'Point',
          coordinates: [
            -61.2158203125,
            -15.97189158092897,
          ],
        },
      },
      {
        type: 'Feature',
        properties: {
          message: 'Baz',
          iconSize: [40, 40],
        },
        geometry: {
          type: 'Point',
          coordinates: [
            -63.29223632812499,
            -18.28151823530889,
          ],
        },
      },
    ],
  };

  mapboxgl.accessToken = 'pk.eyJ1IjoiZGFuYWN0aXZlIiwiYSI6ImNpdmo0OGo2YTAxcGIyenBkZWZlN3Ewam4ifQ.npY0cY_HdHg1OB692HtcUw';
  const map = new mapboxgl.Map({
    container: 'mapBox', // container id
    style: 'mapbox://styles/mapbox/streets-v9', // stylesheet location
    center: [-66.324462890625, -16.024695711685304], // starting position
    zoom: 3, // starting zoom
  });

  // add markers to map
  geojson.features.forEach((marker) => {
    // create a DOM element for the marker
    const el = document.createElement('div');
    el.className = 'marker';
    el.style.backgroundImage = `url(https://placekitten.com/g/${marker.properties.iconSize.join('/')}/)`;
    el.style.width = `${marker.properties.iconSize[0]}px`;
    el.style.height = `${marker.properties.iconSize[1]}px`;

    el.addEventListener('click', () => {
      window.alert(marker.properties.message);
    });

    // add marker to map
    new mapboxgl.Marker(el, { offset: [-marker.properties.iconSize[0] / 2, -marker.properties.iconSize[1] / 2] })
      .setLngLat(marker.geometry.coordinates)
      .addTo(map);
  });
}

// If Node.js then export as public
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
  module.exports = {
    createMap,
  };
}

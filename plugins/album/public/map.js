/* global document, getQueryByName, mapboxgl, window */
function createMap(containerId) {
  mapboxgl.accessToken = 'pk.eyJ1IjoiZGFuYWN0aXZlIiwiYSI6ImNpdmo0OGo2YTAxcGIyenBkZWZlN3Ewam4ifQ.npY0cY_HdHg1OB692HtcUw';
  window.map = new mapboxgl.Map({
    container: containerId,
    style: 'mapbox://styles/mapbox/satellite-streets-v10',
    center: [-103.59179687498357, 40.66995747013945],
    zoom: 3,
  });

  window.map.on('load', () => {
    const albumStem = getQueryByName('album_stem');
    const gallery = getQueryByName('gallery');

    // Add a new source from our GeoJSON data and set the
    // 'cluster' option to true.
    window.map.addSource('earthquakes', {
      type: 'geojson',
      // Point to GeoJSON data. This example visualizes all M1.0+ earthquakes
      // from 12/22/15 to 1/21/16 as logged by USGS' Earthquake hazards program.
      data: `/geojson?album_stem=${albumStem}&gallery=${gallery}`,
      cluster: true,
      clusterMaxZoom: 14, // Max zoom to cluster points on
      clusterRadius: 50, // Radius of each cluster when clustering points (defaults to 50)
    });

    // Use the earthquakes source to create five layers:
    // One for unclustered points, three for each cluster category,
    // and one for cluster labels.
    window.map.addLayer({
      id: 'unclustered-points',
      type: 'symbol',
      source: 'earthquakes',
      filter: ['!has', 'point_count'],
      layout: {
        'icon-image': 'marker-15',
      },
    });

    // Display the earthquake data in three layers, each filtered to a range of
    // count values. Each range gets a different fill color.
    const layers = [
      [150, '#f28cb1'],
      [20, '#f1f075'],
      [0, '#51bbd6'],
    ];

    layers.forEach((layer, i) => {
      window.map.addLayer({
        id: `cluster-${i}`,
        type: 'circle',
        source: 'earthquakes',
        paint: {
          'circle-color': layer[1],
          'circle-radius': 18,
        },
        filter: i === 0 ?
          ['>=', 'point_count', layer[0]] :
          ['all', ['>=', 'point_count', layer[0]], ['<', 'point_count', layers[i - 1][0]]],
      });
    });

    // Add a layer for the clusters' count labels
    window.map.addLayer({
      id: 'cluster-count',
      type: 'symbol',
      source: 'earthquakes',
      layout: {
        'text-field': '{point_count}',
        'text-font': [
          'DIN Offc Pro Medium',
          'Arial Unicode MS Bold',
        ],
        'text-size': 12,
      },
    });
  });
}

// If Node.js then export as public
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
  module.exports = {
    createMap,
  };
}

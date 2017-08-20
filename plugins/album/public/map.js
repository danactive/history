/* global getQueryByName, mapboxgl, window */
function createMap(containerId) {
  mapboxgl.accessToken = 'pk.eyJ1IjoiZGFuYWN0aXZlIiwiYSI6ImNpdmo0OGo2YTAxcGIyenBkZWZlN3Ewam4ifQ.npY0cY_HdHg1OB692HtcUw';
  window.map = new mapboxgl.Map({
    container: containerId,
    style: 'mapbox://styles/mapbox/satellite-streets-v10',
    center: [-103.59179687498357, 40.66995747013945],
    zoom: 3
  });

  window.map.on('load', () => {
    const albumStem = getQueryByName('album_stem');
    const gallery = getQueryByName('gallery');

    window.map.addSource('poi', {
      type: 'geojson',
      data: `/geojson?album_stem=${albumStem}&gallery=${gallery}`,
      cluster: true,
      clusterMaxZoom: 14, // Max zoom to cluster points on
      clusterRadius: 50 // Radius of each cluster when clustering points (defaults to 50)
    });

    window.map.addLayer({
      id: 'clusters',
      type: 'circle',
      source: 'poi',
      filter: ['has', 'point_count'],
      paint: {
        'circle-color': {
          property: 'point_count',
          type: 'interval',
          stops: [
            [0, '#51bbd6'],
            [100, '#f1f075'],
            [750, '#f28cb1']
          ]
        },
        'circle-radius': {
          property: 'point_count',
          type: 'interval',
          stops: [
            [0, 20],
            [100, 30],
            [750, 40]
          ]
        }
      }
    });

    window.map.addLayer({
      id: 'cluster-count',
      type: 'symbol',
      source: 'poi',
      filter: ['has', 'point_count'],
      layout: {
        'text-field': '{point_count_abbreviated}',
        'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
        'text-size': 12
      }
    });

    window.map.addLayer({
      id: 'unclustered-point',
      type: 'circle',
      source: 'poi',
      filter: ['!has', 'point_count'],
      paint: {
        'circle-color': '#11b4da',
        'circle-radius': 8,
        'circle-stroke-width': 1,
        'circle-stroke-color': '#fff'
      }
    });
  });
}

// If Node.js then export as public
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
  module.exports = {
    createMap
  };
}

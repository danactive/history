const getMapStyle = currentMemory => ({
  version: 8,
  name: 'Photo',
  sources: {
    overlay: {
      type: 'image',
      url: currentMemory.photoLink || currentMemory.thumbLink,
      coordinates: [
        // long lat
        [0, 9.25], // top left
        [17.5, 9.25], // top right
        [17.5, 0], // bottom right
        [0, 0], // bottom left
      ],
    },
  },
  layers: [
    {
      id: 'background',
      type: 'background',
      paint: { 'background-color': '#111' },
    },
    {
      id: 'overlay',
      source: 'overlay',
      type: 'raster'
    },
  ],
});

const getMapOptions = currentMemory => ({
  containerStyle: {
    height: '100%',
    width: '100%',
  },
  maxZoom: 7,
  minZoom: 4.5,
  zoom: [5],
  center: [8.75, 4.625],
  style: getMapStyle(currentMemory),
});

export {
  getMapOptions,
}

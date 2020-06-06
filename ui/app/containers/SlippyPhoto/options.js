const getMapStyle = ({ coordinates, url }) => ({
  version: 8,
  name: 'Photo',
  sources: {
    photoSrc: {
      type: 'image',
      url,
      coordinates,
    },
  },
  layers: [
    {
      id: 'background',
      type: 'background',
      paint: { 'background-color': '#111' },
    },
    {
      id: 'photoId',
      source: 'photoSrc',
      type: 'raster',
    },
  ],
});

const getMapOptions = (source) => ({
  containerStyle: {
    height: '100%',
    width: '100%',
  },
  zoom: [5],
  center: [8.75, 4.625],
  style: getMapStyle(source),
});

export default getMapOptions;

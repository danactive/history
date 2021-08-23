import credentials from '../../credentials.json';

export default async function handler(req, res) {
  const keyword = 'vancouver';
  const latitude = (req.query && req.query.lat) || '';
  const longitude = (req.query && req.query.lon) || '';
  const url = `https://www.flickr.com/services/rest/?method=flickr.photos.search&api_key=${credentials.flickr.api_key}&lat=${latitude}&lon=${longitude}&format=json&nojsoncallback=1`;
  const response = await fetch(url);
  const result = await response.json();

  const paths = result.photos.photo.map((photo) => ({
    path: `https://live.staticflickr.com/${photo.server}/${photo.id}_${photo.secret}.jpg`,
  }));

  // res.send(paths);
  res.send({photos: paths});
}

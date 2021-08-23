
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react';

const Nearby = () => {
  const router = useRouter();
  const { lon } = router.query;
  const { lat } = router.query;

  const [nearbyPhotos, setNearbyPhotos] = useState(null);
  const latitude = (lat) || '';
  const longitude = (lon) || '';
  const fetchPhotos = async () => {
    const response = await fetch(`/api/flickr?lat=${latitude}&lon=${longitude}`);
    const result = await response.json();
    console.log(result)
    setNearbyPhotos(result.photos.map((photo) => (
    <li><img src={photo.path} alt="image" /></li>
    )));
  }

  useEffect(() => {
    fetchPhotos();
  }, []);

  if (nearbyPhotos === null) {
    return <h1>null</h1>
  }

  return (
    <div>
      <button onClick={() => router.back()}>Click here to go back</button>
      <h1>Nearby</h1>
      <h2>{latitude}, {longitude}</h2>
      <link rel="icon" href="/favicon.ico" />
      <ul>{nearbyPhotos}</ul>
    </div>
  )
}

export default Nearby

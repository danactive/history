
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react';
import styled, { css } from 'styled-components'

const ImageList = styled.ul`
  width: 80%;
  margin: 0 auto;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
`;

const Pic = styled.img`
  width: 100%;
`;

const ImageItem = styled.li`
  width: 17%;
`;

const ErrorMessage = styled.p`
  font-size: 22px;
  padding-left: 20px 0px;
`;

const Container = styled.div`
  padding: 40px;
`;

const Nearby = () => {
  const router = useRouter();
  const { lon } = router.query;
  const { lat } = router.query;

  const [nearbyPhotos, setNearbyPhotos] = useState(null);
  const [largePhoto, setLargePhoto] = useState(null);
  // const [highlight, setHighlight] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  const latitude = (lat) || '';
  const longitude = (lon) || '';

  const fetchPhotos = async () => {
    try {
      const response = await fetch(`/api/flickr?lat=${latitude}&lon=${longitude}`);
      const result = await response.json();
      setNearbyPhotos(result.photos.map((photo, index) => (
      <ImageItem key={index}>
        <Pic src={photo.path} alt="image" onClick={() => { handleClick(photo.path) }} />
      </ImageItem>
      )));
    } catch {
      setErrorMsg('Could not connect. Please try again later.')
    }
  }

  const handleClick = (path) => {
    setLargePhoto(path)
  }

  useEffect(() => {
    fetchPhotos();
  }, []);

  return (
    <Container>
      <button onClick={() => router.back()}>Click here to go back</button>
      <h1>Nearby</h1>
      <h2>{latitude}, {longitude}</h2>
      {errorMsg && (
        <ErrorMessage>{errorMsg}</ErrorMessage>
      )}
      {nearbyPhotos && (
        <div>
          <img src={largePhoto} alt="image" />
          <ImageList>{nearbyPhotos}</ImageList>
        </div>
      )}
    </Container>
  )
}

export default Nearby

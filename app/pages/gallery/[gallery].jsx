import { useRouter } from 'next/router'

const Gallery = () => {
  const router = useRouter()
  const { gallery } = router.query

  return (
    <div>Gallery page for {gallery}</div>
  )
}

export default Gallery

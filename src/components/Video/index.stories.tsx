import VideoPlayerHTML5 from '.'

export default {
  title: 'VideoPlayerHTML5',
  component: VideoPlayerHTML5,
}

export function Video() {
  return (
    <VideoPlayerHTML5
      description="My video description text"
      extension="mp4"
      poster="/galleries/demo/media/photos/2012/2012-fireplace.jpg"
      src="/galleries/demo/media/videos/2012-fireplace.mp4"
    />
  )
}

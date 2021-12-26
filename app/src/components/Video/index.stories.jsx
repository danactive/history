import VideoPlayerHTML5 from '.'

export default {
  title: 'VideoPlayerHTML5',
  component: VideoPlayerHTML5,
}

export const Video = () => (
  <VideoPlayerHTML5
    extension="mp4"
    poster="/galleries/demo/media/photos/2012/2012-fireplace.jpg"
    src="/galleries/demo/media/videos/2012-fireplace.mp4"
  />
)

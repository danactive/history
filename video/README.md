# Convert your camera video source files to HTML5 web video

Using Docker to use the latest FFMPEG
https://hub.docker.com/r/jrottenberg/ffmpeg/

* Convert input video file (input.MTS) in the **current directory** into an MP4
  * `docker run -v $PWD:/temp/ jrottenberg/ffmpeg -stats -i /temp/input.MTS /temp/output.MP4`

* [Rotate MP4 video without re-encoding](https://stackoverflow.com/questions/25031557/rotate-mp4-videos-without-re-encoding)
  * `docker run -v $PWD:/temp/ jrottenberg/ffmpeg -stats -i /temp/input.MP4  -c copy -metadata:s:v:0 rotate=90 /temp/output.MP4`

* [More ffmpeg command details](../public/galleries/gallery-demo/media/videos/README.md)

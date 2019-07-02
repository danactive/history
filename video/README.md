# Convert your camera video source files to HTML5 web video

Using Docker to use the latest FFMPEG
https://hub.docker.com/r/jrottenberg/ffmpeg/

Convert input video file (input.MTS) in the **current directory** into an MP4

`docker run -v $PWD:/temp/ jrottenberg/ffmpeg -stats -i /temp/input.MTS /temp/output.MP4`
        
[More ffmpeg command details](../public/galleries/gallery-demo/media/videos/README.md)

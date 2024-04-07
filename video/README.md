# Convert your camera video source files to HTML5 web video

[Using Docker to use the latest FFMPEG](https://hub.docker.com/r/jrottenberg/ffmpeg/)

* Convert input video file (input.MTS) in the **current directory** into an MP4
```
docker run -v $PWD:/temp/ jrottenberg/ffmpeg -stats -i /temp/input.MTS /temp/output.MP4
```

* [Rotate MP4 video without re-encoding](https://stackoverflow.com/questions/25031557/rotate-mp4-videos-without-re-encoding)
```
docker run -v $PWD:/temp/ jrottenberg/ffmpeg -stats -i /temp/input.MP4  -c copy -metadata:s:v:0 rotate=90 /temp/output.MP4
```

* Delay beginning (_-ss_) and/or trim duration (_-t_). [Time syntax reference](http://ffmpeg.org/ffmpeg-utils.html#time-duration-syntax)
```
docker run -v $PWD:/temp/ jrottenberg/ffmpeg -stats -i /temp/input.MTS -ss 8 -t 7 /temp/output.MP4
```

* [Convert AVI to MP4 - generate H.264 content for Apple software/devices](https://apple.stackexchange.com/questions/166553/why-wont-video-from-ffmpeg-show-in-quicktime-imovie-or-quick-preview#166554) use `-pix_fmt yuv420p`
```
docker run -v $PWD:/temp/ jrottenberg/ffmpeg -stats -i /temp/input.avi -pix_fmt yuv420p /temp/output.MP4
```

* Remove audio track(s) with `an` flag
```
docker run -v $PWD:/temp/ jrottenberg/ffmpeg -stats -i /temp/input.mov -an /temp/output.MP4
```

* iPhone 13 Pro with Dolby Vision is not currently supported by FFMPEG
  * Deep discussion on how to [Code Calamity](https://codecalamity.com/encoding-uhd-4k-hdr10-videos-with-ffmpeg/)
  * How to convert Dolby Vision HDR to HDR10+?
    * [Reddit](https://www.reddit.com/r/ffmpeg/comments/nkxbay/how_to_convert_dolby_vision_hdr_to_hdr10/)
    * [superuser](https://superuser.com/questions/1651568/how-to-convert-dolby-vision-hdr-to-hdr10)
  * iPhone similar issue [Reddit](https://www.reddit.com/r/ffmpeg/comments/o00ymo/help_iphone_hevc_file_converted_to_h264_has_color/)
  * Desaturation similar issue [superuser](https://superuser.com/questions/1511254/ffmpeg-video-compression-desaturating-colors-losing-color-information)
  * This seems to be a tool [GitHub](https://github.com/DolbyLaboratories/dlb_mp4base/tree/master)
* Related issue but no solution [Reddit](https://www.reddit.com/r/ffmpeg/comments/y2nrcc/ffmpeg_struggles_to_transcode_iphone_13_pro_hevc/)
* Intro article [Medium](https://medium.com/abraia/video-transcoding-and-optimization-for-web-with-ffmpeg-made-easy-511635214df0)
* [More ffmpeg command details](./public/galleries/demo/media/videos/README.md)

# Links
* My camera [[https://panasonic.ca/english/audiovideo/camerascamcorders/digitalstill/high_zoom_specs.asp|Panasonic Lumix DMC-ZS3]] creates AVCHD video (.MTS)
* Encode using free open-source [[http://www.ffmpeg.org|FFMPEG]] ([[http://ffmpeg.zeranoe.com/builds/|download latest static 32-bit build]])
* Dive into HTML5 [[http://diveintohtml5.info/video.html|HTML5 video reference]]
* Willus.com [[http://www.willus.com/author/streaming2.shtml|Conversion syntax]]
* FFMPEG [[http://ffmpeg.org/ffmpeg.html#SEC11|Official conversion documentation]]
* CatsWhoCode.com [[http://www.catswhocode.com/blog/19-ffmpeg-commands-for-all-needs|19 ffmpeg commands for all needs]]
* Node.js [[https://github.com/xonecas/ffmpeg-node|Batch convert]]

# FFMPEF encode to...
* -t [sec] duration
* -threads two CPU threads
* -i is input path
* -acodec set audio codec
* -vcodec set video codec: H.264 format supported through libx264; WebM thru VP8

### For the transpose parameter you can pass:
* 0 = 90CounterCLockwise and Vertical Flip (default)
* 1 = 90Clockwise
* 2 = 90CounterClockwise
* 3 = 90Clockwise and Vertical Flip

## WebM
* ffmpeg64 -threads 2 -i input_video.MTS -acodec libvorbis output_video.webm
* ffmpeg64 -threads 2 -i 2013-11-03-13.mov -acodec libvorbis -vf transpose=1 2013-11-03-13.webm

## H.64
* ffmpeg64 -threads 2 -i input_video.MTS -vcodec libx264 output_video.mp4
* ffmpeg64 -threads 2 -i 2013-11-03-13.mov -vcodec libx264 -vf "rotate=90*PI/180" 2013-11-03-13.mp4

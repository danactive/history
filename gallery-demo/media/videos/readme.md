# Links
* My camera [[https://panasonic.ca/english/audiovideo/camerascamcorders/digitalstill/high_zoom_specs.asp|Panasonic Lumix DMC-ZS3]] creates AVCHD video (.MTS)
* Encode using free open-source [[http://www.ffmpeg.org|FFMPEG]] ([[http://ffmpeg.zeranoe.com/builds/|download latest static 32-bit build]])
* Dive into HTML5 [[http://diveintohtml5.info/video.html|HTML5 video reference]]
* Willus.com [[http://www.willus.com/author/streaming2.shtml|Conversion syntax]]
* FFMPEG [[http://ffmpeg.org/ffmpeg.html#SEC11|Official conversion documentation]]
* CatsWhoCode.com [[http://www.catswhocode.com/blog/19-ffmpeg-commands-for-all-needs|19 ffmpeg commands for all needs]]
* Node.js [[https://github.com/xonecas/ffmpeg-node|Batch convert]]

# FFMPEF encode to...
* -t [sec] stop duration
* -threads two CPU threads
* -i is input path
* -acodec set audio codec
* -vcodec set video codec: H.264 format supported through libx264; WebM thru VP8
* -sn Disable subtitle recording (prevents pgssub -> ? error)

### For the transpose parameter you can pass:
* 0 = 90CounterCLockwise and Vertical Flip (default)
* 1 = 90Clockwise
* 2 = 90CounterClockwise
* 3 = 90Clockwise and Vertical Flip

## WebM
* ffmpeg64 -threads 2 -i input.MTS -acodec libvorbis output.WEBM
* ffmpeg64 -threads 2 -i input_rotate.MOV -acodec libvorbis -vf transpose=1 output_rotate.WEBM
* ffmpeg64 -threads 2 -i input_shorten.MOV -acodec libvorbis -t 6 output_shorten.WEBM

## H.64 (MP4)
* ffmpeg64 -threads 2 -i input.MTS -vcodec libx264 output.MP4
* ffmpeg64 -threads 2 -i input_rotate.MOV -vcodec libx264 -vf "rotate=90*PI/180" output_rotate.MP4
* ffmpeg64 -threads 2 -i input_shorten.MOV -vcodec libx264 -t 6 output_shorten.MP4
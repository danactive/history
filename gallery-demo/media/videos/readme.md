# Links
* My camera [[https://panasonic.ca/english/audiovideo/camerascamcorders/digitalstill/high_zoom_specs.asp|Panasonic Lumix DMC-ZS3]] creates AVCHD video (.MTS)
* Encode using free open-source [[http://www.ffmpeg.org|FFMPEG]] ([[http://ffmpeg.zeranoe.com/builds/|download latest static 64-bit build]])
* Dive into HTML5 [[http://diveintohtml5.info/video.html|HTML5 video reference]]
* Willus.com [[http://www.willus.com/author/streaming2.shtml|Conversion syntax]]
* FFMPEG [[http://ffmpeg.org/ffmpeg.html#SEC11|Official conversion documentation]]
* CatsWhoCode.com [[http://www.catswhocode.com/blog/19-ffmpeg-commands-for-all-needs|19 ffmpeg commands for all needs]]
* Node.js [[https://github.com/xonecas/ffmpeg-node|Batch convert]]

# FFMPEG encode to...
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
* ffmpeg -i input.MTS -codec:v libvpx -quality good -cpu-used 0 -b:v 600k -maxrate 600k -bufsize 1200k -qmin 10 -qmax 42 -vf scale=-1:480 -threads 4 -codec:a libvorbis -b:a 128k output.WEBM
* ffmpeg -i input.MOV -codec:v libvpx -quality good -cpu-used 0 -b:v 600k -maxrate 600k -bufsize 1200k -qmin 10 -qmax 42 -vf scale=-1:480 -threads 4 -codec:a libvorbis -b:a 128k -vf transpose=1 output_rotated.WEBM
* ffmpeg -i input.MOV -codec:v libvpx -quality good -cpu-used 0 -b:v 600k -maxrate 600k -bufsize 1200k -qmin 10 -qmax 42 -vf scale=-1:480 -threads 4 -codec:a libvorbis -b:a 128k -t 6 output_shorten.WEBM
* ffmpeg -ss 6 -i input.MTS -codec:v libvpx -quality good -cpu-used 0 -b:v 600k -maxrate 600k -bufsize 1200k -qmin 10 -qmax 42 -vf scale=-1:480 -threads 4 -codec:a libvorbis -b:a 128k output_delayed.WEBM

## H.64 (MP4)
* ffmpeg -threads 2 -i input.MTS -vcodec libx264 output.MP4
* ffmpeg -threads 2 -i input.MOV -vcodec libx264 -vf "rotate=90*PI/180" output_rotate.MP4
* ffmpeg -threads 2 -i input.MOV -vcodec libx264 -t 6 output_shorten.MP4
* ffmpeg -ss 6 -threads 2 -i input.MTS -vcodec libx264 output_delayed.MP4
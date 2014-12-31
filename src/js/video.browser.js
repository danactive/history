/*global $, util*/
'use strict';
var arrQs,
    download = [],
    gallery,
    html5Vid,
    qs = util.queryObj();

arrQs = qs["videos"].split(',');
gallery = qs["gallery"];
html5Vid = ['<video controls="true" width="', qs["w"], '" height="', qs["h"], '">'];


$.each(arrQs, function (i, vidSrc) {
    var vidType = vidSrc.substr(vidSrc.lastIndexOf('.')+1).toLowerCase();
    vidSrc = '/static/gallery-' + gallery + '/media/videos/' + vidSrc;
    switch (vidType) {
        case 'mp4':
            html5Vid.push('<source src="', vidSrc, '"  type=\'video/mp4; codecs="avc1.4D401E, mp4a.40.2"\'>');
            break;
        case 'webm':
            html5Vid.push('<source src="', vidSrc, '"  type=\'video/webm; codecs="vp8, vorbis"\'>');
            break;
        case 'ogv':
            html5Vid.push('<source src="', vidSrc, '"  type=\'video/ogg; codecs="theora, vorbis"\'>');
            break;
    }
    download.push('<div><a href="', vidSrc, '">Download Video</a></div>');
});
html5Vid.push('</video>');
$('body').html(html5Vid.join('') + download.join(''));
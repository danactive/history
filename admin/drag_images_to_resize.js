var fs = require('fs'),
	path = require('path'),
	gm = require('gm'); // img manipulation

exports.init = function (param) {
	var response = param.response,
		request = param.request,
		draggedPath = request.files.draggedFile._writeStream.path,
		newFilename = request.body.filenames,
		photoTargetPath = 'media/photos/' + newFilename.substring(0, 4) + '/' + newFilename,
		thumbTargetPath = 'media/thumbs/' + newFilename.substring(0, 4) + '/' + newFilename;

    fs.rename(draggedPath, photoTargetPath); // to photos

	// obtain the size of an image
	gm(photoTargetPath).
		crop(185, 45, 0, 0).
		write(thumbTargetPath,	function (err) {
		if (err) {
			output = 'Node GM error: ' + err;
			
			response.writeHead(200, {'Content-Type': 'text/html'});
			response.write("<h1>Image processed</h1>");
			response.end('<p>|' + output + "|</p>");
		}
	});
}
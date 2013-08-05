var fs = require('fs'),
	gm = require('gm'), // img manipulation
	mkdirp = require('mkdirp'), // create folder
	path = require('path');

exports.init = function (param) {
	var response = param.response,
		request = param.request,
		photo = { width: 800, height: 600 },
		thumb = { width: 185, height: 45 },
		i = 0,
		responseOutput = [],
		renameMakeFolder = function (param) {
			var newFileStream,
				photoTargetPath,
				tempFileStream,
				newFilename = param.newFilename,
				draggedFile = param.draggedFile;

			mkdirp(path.dirname(__dirname) + '/resizeImages/' + newFilename.substring(0, 4), function (errDir) {
				if (errDir) throw errDir;
				photoTargetPath = [path.dirname(__dirname), '/resizeImages/', newFilename.substring(0, 4), '/', newFilename].join('');
				tempFileStream = fs.createReadStream(draggedFile.path);
				newFileStream = fs.createWriteStream(photoTargetPath);

				tempFileStream.pipe(newFileStream);
				tempFileStream.on('end', function(errRename) {
					if (errRename) throw errRename;
					responseOutput.push('renamed complete to ', photoTargetPath);
					fs.unlinkSync(draggedFile.path);
					resizeImages(photoTargetPath);

					i+=1;
					if (param.lastFile === true) {
						response.writeHead(200, {'Content-Type': 'text/html'});
						response.write(responseOutput.join('<br>'));
						response.end();
					}
				});
			});
		},
		resizeImages = function (photoFile) {
			gm(photoFile)
			.autoOrient()
			.stream(function (errOrient, stdout, stderr) {
				gm(stdout)
				.resize(photo.width, photo.height)
				.write(photoFile+'-photo.jpg', function (errResize) {
					if (errResize) {
						console.error('Photo resize write error: ' + errResize);
					}
				});

				gm(stdout)
				.resize(thumb.width, thumb.height, "!")
				.noProfile()
				.write(photoFile+'-thumb.jpg', function (errResize) {
					if (errResize) {
						console.error('Thumb resize write error: ' + errResize);
					}
				});
			});
		};

	if (request.files.draggedFile.length) { // more than 1 image
		for ( var i = 0, len = request.files.draggedFile.length, requestObject; i < len; i+=1 ) {
			requestObject = {
				"draggedFile": request.files.draggedFile[i],
				"newFilename": request.body.filename[i]
			};
			if (i === len - 1) {
				requestObject.lastFile = true;
			}
			renameMakeFolder(requestObject);
		}
	} else {
		renameMakeFolder({
			"draggedFile": request.files.draggedFile,
			"newFilename": request.body.filename,
			"lastFile": true
		});
	}
};
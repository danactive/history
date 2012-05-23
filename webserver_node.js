var path = require('path'),
	fs = require('fs'),
	expressPort = 80,
	serveStaticPages = function (param) {
		var request = param.request,
			response = param.response,
			filePath = '.' + request.url.split('?')[0],
			loadHomePage = function () { // learn all the gallery folders
				var getGalleries = require('./admin/get_gallery_directories.js'),
				galleriesJson = getGalleries.init({ request: request, response: response, forNode: true }),
				galleries = galleriesJson.galleries,
				i,
				len = galleries.length;

				response.writeHead(200, {'Content-Type': 'text/html'});
				response.write("<h1>Photo Galleries</h1><ul>");

				for (i = 0; i < len; i++) {
					response.write('<li><a href="gallery-' + galleries[i] + '/gallery.xml">' + galleries[i] + '</li>');
				}
				response.write("</ul>");
				response.end('<a href="/admin/">Admin</a>');
			},
			isHomePage = filePath === './',
			isAdminLandingPage = (filePath === './admin' || filePath === './admin/'),
			isGalleryLandingPage = (filePath.indexOf('./gallery-') === 0 && filePath.lastIndexOf('/') === filePath.length - 1); // match gallery-xxx/ but not gallery-xxx; use this code to match without ending slash filePath.substr(filePath.indexOf('gallery-') + 'gallery-'.length).indexOf('/') === -1

		if (isHomePage) {
			loadHomePage();
			return;
		} else if (isAdminLandingPage) {
			filePath = filePath + '/index.htm';
		} else if (isGalleryLandingPage) {
			filePath = filePath + '/gallery.xml';
		}
			
		var extname = path.extname(filePath),
		contentType = 'text/plain';
		
		switch (extname) {
			case '.css':
				contentType = 'text/css';
				break;
			case '.html':
			case '.htm':
				contentType = 'text/html';
				break;
			case '.ico':
				contentType = 'image/vnd.microsoft.icon';
				break;
			case '.jpg':
			case '.jpeg':
				contentType = 'image/jpeg';
				break;
			case '.js':
				contentType = 'text/javascript';
				break;
			case '.mp4':
				contentType = 'video/mp4';
				break;
			case '.png':
				contentType = 'image/png';
				break;
			case '.webm':
				contentType = 'video/webm';
				break;	
			case '.xml':
				contentType = 'text/xml';
				break;
			case '.xsl':
			case '.xslt':
				contentType = 'text/xsl';
				break;
		}
		
		console.log('Requesting ' + extname + ' from ' + filePath + ' as ' + contentType);
		 
		path.exists(filePath, function(exists) {
			if (exists) {
				fs.readFile(filePath, function(error, content) {
					if (error) {
						response.writeHead(500);
						response.end();
					} else {
						response.writeHead(200, { 'Content-Type': contentType });
						response.end(content, 'utf-8');
					}
				});
			}
			else {
				response.writeHead(404, {'Content-Type': 'text/html'});
				response.write("<h1>404 Not Found</h1>");
				response.end("The page you were looking for: " + filePath + " can not be found");
			}
		});
	},
	
	express = require('express'),
	app = express.createServer();

app.use(express.bodyParser());

app.post('/resizeImages/', function(req, res){
	var imgResize = require('./admin/drag_images_to_resize.js');
	imgResize.init({request: req, response: res});
});

app.get('/getGalleries/', function(req, res){
	var getGalleries = require('./admin/get_gallery_directories.js');
	getGalleries.init({request: req, response: res, forNode: false});
});

app.get('*', function(req, res){
	serveStaticPages({request: req, response: res});
});

app.listen(expressPort);

console.log('Server running at http://localhost:' + expressPort);
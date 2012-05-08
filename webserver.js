var path = require('path'),
	fs = require('fs'),
	expressPort = 80,
	serveStaticPages = function (param) {
		var request = param.request,
			response = param.response,
			filePath = '.' + request.url;
		filePath = filePath.split('?')[0];

		if (filePath == './') {
			filePath = './index.htm';
		} else if (filePath == './admin') {
			filePath = './admin/index.htm';
		}
			
		var extname = path.extname(filePath),
		contentType = 'text/html';
		
		switch (extname) {
			case '.js':
				contentType = 'text/javascript';
				break;
			case '.css':
				contentType = 'text/css';
				break;
			case '.xml':
				contentType = 'text/xml';
				break;
			case '.xsl':
			case '.xslt':
				contentType = 'text/xsl';
				break;
			case '.jpg':
				contentType = 'image/jpeg';
				break;
			case '.png':
				contentType = 'image/png';
				break;
			case '.webm':
				contentType = 'video/webm';
				break;	
			case '.mp4':
				contentType = 'video/mp4';
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

app.post('/img', function(req, res){
	var imgResize = require('./admin/drag_images_to_resize.js');
	imgResize.init({request: req, response: res});
});

app.get('*', function(request, response){
	serveStaticPages({request: request, response: response });
});

app.listen(expressPort);

console.log('Server running at http://localhost:' + expressPort);
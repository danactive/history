/*global __dirname, console, require*/
var doT = require('doT'),
	express = require('express'),
	app = express(),
	expressPort = 80,
	constant = {
		"tempThumbFolder": '_historyThumb'
	},
	path = require('path'),
	serveStaticPages = function (param) {
		var request = param.request,
			response = param.response,
			filePath = '.' + request.url.split('?')[0],
			fs = require('fs'),
			loadHomePage = function () { // learn all the gallery folders
				var getGalleries = require('./admin/get_gallery_directories.js'),
				galleriesJson = getGalleries.init({ request: request, response: response, forNode: true }),
				galleries = galleriesJson.galleries,
				i,
				len = galleries.length;

				response.writeHead(200, {'Content-Type': 'text/html'});
				response.write("<h1>Photo Galleries</h1><ul>");

				for (i = 0; i < len; i+=1) {
					response.write('<li><a href="gallery-' + galleries[i] + '/gallery.xml">' + galleries[i] + '</li>');
				}
				response.write("</ul>");
				response.end('<a href="/admin/">Admin</a>');
			},
			isHomePage = filePath === './',
			isAdminLandingPage = (filePath === './admin' || filePath === './admin/'),
			isGalleryLandingPage = (filePath.indexOf('./gallery-') === 0 && filePath.lastIndexOf('/') === filePath.length - 1); // match gallery-xxx/ but not gallery-xxx; use this code to match without ending slash filePath.substr(filePath.indexOf('gallery-') + 'gallery-'.length).indexOf('/') === -1
		filePath = decodeURI(filePath); // handle spaces in path
		if (isHomePage) {
			loadHomePage();
			return;
		} else if (isAdminLandingPage) {
			filePath = filePath + '/index.htm';
		} else if (isGalleryLandingPage) {
			filePath = filePath + '/gallery.xml';
		}
			
		fs.exists(filePath, function(exists) {
			if (exists) {
				fs.readFile(filePath, function(error, content) {
					if (error) {
						response.writeHead(500);
						response.end();
					} else {
						response.contentType(path.extname(filePath));
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
	};

app.use(express.bodyParser()); // POST data

app.configure(function () {
	app.set("views", path.join(__dirname, "views"));
	app.engine("dot", require("dot-emc").init({"app": app}).__express);
	app.set("view engine", "dot");
});

app.post(/resizeImages/, function (request, response) {
	require('./admin/drag_images_to_resize.js').init({"request": request, "response": response});
});

app.get(/getGalleries/, function (request, response) {
	var getGalleries = require('./admin/get_gallery_directories.js');
	getGalleries.init({"request": request, "response": response, "forNode": false});
});

app.get(/(admin\/walk-path)/, function(request, response) {
	response.render(
		'admin.node.dot',
		{
			"page": 'directory-list',
			"scripts": [
				'/lib/jquery-2.0.3.min.js',
				'/js/global.js',
				'/js/walk-path-tested.js',
				'/js/directory-contents.js',
				'/lib/jquery-ui-1.10.3.datepicker.sortable/jquery-ui-1.10.3.custom.min.js',
				'/public/views.js'
			],
			"css": [
				'/lib/jquery-ui-1.10.3.datepicker.sortable/humanity/jquery-ui-1.10.3.custom.min.css',
				'/css/directory-contents.css'
			]
		}
	);
});
app.get(/(api\/walk-path)/, function(request, response) {
	require('./js/admin-directory-contents-api.js').list({"constant": constant, "request": request, "response": response});
});
app.get(/(admin\/diff-album-path)/, function(request, response) {
	response.render(
		'admin.node.dot',
		{
			"page": 'diff-xml',
			"scripts": [
				'/lib/jquery-2.0.3.min.js',
				'/js/global.js',
				'/lib/json_to_xml.js',
				'/js/album-xml.js'
			],
			"css": [
			]
		}
	);
});
app.post(/(admin\/preview-generator)/, function(request, response) {
	require('./js/admin-image-manipulation.js').preview({"constant": constant, "request": request, "response": response});
});
app.post(/(admin\/rename-photos)/, function(request, response) {
	require('./js/admin-image-manipulation.js').rename({"constant": constant, "request": request, "response": response});
});
app.get(/(admin\/resize-photos)/, function(request, response) {
	require('./js/admin-image-manipulation.js').resize({"constant": constant, "request": request, "response": response});
});

app.get('*', function(request, response) {
	serveStaticPages({"request": request, "response": response});
});

app.listen(expressPort);

console.log('Server running at http://localhost:' + expressPort);
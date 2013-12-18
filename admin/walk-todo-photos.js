exports.init = function (param) {
	var action = 'list',
		currentFolder = '',
		files,
		response = param.response,
		request = param.request;

	(function () { // set variables
		var fs = require('fs'),
			paramsWithValue = require('querystring').parse(require('url').parse(request.url).query);

		if (paramsWithValue) {
			if (paramsWithValue.action) {
				action = paramsWithValue.action;
			}
			if (paramsWithValue.folder) {
				currentFolder = paramsWithValue.folder + '/';
				files = fs.readdirSync('./' + paramsWithValue.folder);
			}
		}
		if (!files) {
			files = fs.readdirSync('.');
		}
	})();

	generateHtml = function () {
		var file,
			html = [],
			i = 0,
			isFolder,
			isRasterFile,
			len = files.length;

		html.push('<ol>');
		for (i; i < len; i++) {
			file = files[i];
			isFolder = (file.lastIndexOf(".") === -1);
			isRasterFile = (file.toLowerCase().indexOf('.jpg') !== -1);
			html.push('<li><a href=".?folder=', currentFolder, encodeURIComponent(file), '&action=list">', file, '</a>');
			if (isRasterFile) {
				if (action === 'list') {
					html.push('<img src="../../', currentFolder, encodeURIComponent(file), '">');
				} else if (action === 'preview') {
					html.push('<img src="../../', currentFolder, encodeURIComponent(file), '" width="30" height="20">');
				}
			}
			if (isFolder) {
				html.push(' <a href=".?folder=', currentFolder, encodeURIComponent(file), '&action=preview">Preview inside this folder</a>');
			}
			html.push('</li>');
		}
		html.push('</ol>');
		return html.join('');
	}
	response.writeHead(200, {'Content-Type': 'text/html'});
	response.end(generateHtml());
}
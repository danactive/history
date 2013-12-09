var fs = require('fs');

exports.init = function (param) {
	var currentFolder,
		generateHtml,
		files,
		response = param.response,
		request = param.request;

	(function () {
		var paramsWithValue = require('querystring').parse(require('url').parse(request.url).query);

		if (paramsWithValue && paramsWithValue.folder) {
			files = fs.readdirSync('./' + paramsWithValue.folder);
			currentFolder = paramsWithValue.folder + '/';
		} else {
			files = fs.readdirSync('.');
			currentFolder = '';
		}
	})();

	generateHtml = function () {
		var html = [],
			i = 0,
			len = files.length,
			isThumb;

		html.push('<ol>');
		for (i; i < len; i++) {
			isThumb = (files[i].toLowerCase().indexOf('.jpg') !== -1);
			html.push('<li><a href=".?folder=', currentFolder, encodeURIComponent(files[i]), '">', files[i], '</a>');
			if (isThumb) {
				html.push('<img src="../../', currentFolder, encodeURIComponent(files[i]), '">');
			}
			html.push('</li>');
		}
		html.push('</ol>');
		return html.join('');
	}
	response.writeHead(200, {'Content-Type': 'text/html'});
	response.end(generateHtml());
}
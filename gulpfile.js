var getGalleries = require('./admin/get_gallery_directories.js'),
	gulp = require('gulp'),
	plugins = require('gulp-load-plugins')({"camelize": true});

gulp.task('xml2json', function () {
	var DEST,
		stream;

	getGalleries().galleries.forEach(function (name) {
		DEST = 'gallery-' + name + '/json';
		stream = gulp.src('gallery-' + name + '/xml/*.xml')
			.pipe(plugins.changed(DEST))
			.pipe(plugins.xml2json())
			.pipe(plugins.rename({"extname": '.json'}))
			.pipe(gulp.dest(DEST));
	});

	return stream;
});

gulp.task('watch', function() {
	var stream;
	getGalleries().galleries.forEach(function (name) {
		stream = gulp.watch('gallery-' + name + '/xml/*.xml', ['xml2json']);
	});

	return stream;
});
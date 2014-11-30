var gulp = require('gulp'),
	plugins = require('gulp-load-plugins')({"camelize": true});

gulp.task('xml2json', function () {
	var getGalleries = require('./admin/get_gallery_directories.js');

	getGalleries().galleries.forEach(function (name) {
		gulp.src('gallery-' + name + '/xml/*.xml')
			.pipe(plugins.xml2json())
			.pipe(plugins.rename({"extname": '.json'}))
			.pipe(gulp.dest('gallery-' + name + '/json'));
	});
});
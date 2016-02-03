'use strict';

var gulp   = require('gulp'),
	paths = {},
	pkg = require('./package.json'),
	plugins = require('gulp-load-plugins')({"camelize": true});

paths.root = ['*.js'];
paths.source = ['src/js/**/*.js', '!src/js/edit_admin_xml.browser.js'];
paths.jsBrowser = ['src/js/**/*.browser.js'];
paths.jsLint = paths.root.concat(paths.source);
paths.views = ['src/views/**/*.dust'];
paths.test = paths.tests = ['src/test/**/*.js', '!src/test/ignore*.js'];
paths.watch = paths.lint;

gulp.task('lint', function () {
	return gulp.src(paths.jsLint)
    .pipe(plugins.plumber())
		.pipe(plugins.expectFile(paths.jsLint))
		.pipe(plugins.eslint({
			extends: 'eslint:recommended',
			globals: { require: true, module: true},
			rules: { "no-console": 0 },
			"ecmaFeatures": {
				"blockBindings": true
			}
		}))
		.pipe(plugins.eslint.format())
		.pipe(plugins.eslint.failAfterError());
});

gulp.task('js', function () {
	return gulp.src(paths.jsBrowser)
		.pipe(plugins.expectFile(paths.jsBrowser))
		.pipe(plugins.rename(function (path) {
			path.basename = path.basename.replace(".browser","");
		}))
		.pipe(gulp.dest('public/js'));
});

gulp.task('test', ['lint'], function () {
	return gulp.src(paths.test)
		.pipe(plugins.expectFile(paths.test))
		.pipe(plugins.mocha({reporter: 'nyan'}));
});

gulp.task('view', function () {
	return gulp.src(paths.views)
		.pipe(plugins.expectFile(paths.views))
		.pipe(plugins.dust())
		.pipe(plugins.concat("views.min.js"))
		.pipe(gulp.dest('public'));
});

gulp.task('watch', ['test'], function () {
	return gulp.watch(paths.watch, ['test']);
});

gulp.task('bundle', ["lint", "js", "view"]);

gulp.task('develop', ["bundle"], function() {
	plugins.developServer.listen({"path": pkg.main});

	gulp.watch(paths.jsBrowser, function () {
		gulp.start("js", function () {
			plugins.developServer.restart();
		});
	});

	gulp.watch(paths.jsLint, function () {
		gulp.start("lint", function () {
			plugins.developServer.restart();
		});
	});

	return gulp.watch(paths.views, function () {
		gulp.start("view", function () {
			plugins.developServer.restart();
		});
	});
});

gulp.task('default', ['develop']);

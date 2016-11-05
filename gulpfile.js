const gulp = require('gulp');
const pkg = require('./package.json');
const plugins = require('gulp-load-plugins')({ camelize: true });

const paths = {};
paths.root = ['*.js'];
paths.lib = ['lib/**/*.js'];
paths.source = ['src/js/**/*.js', '!src/js/edit_admin_xml.browser.js'];
paths.jsBrowser = ['src/js/**/*.browser.js'];
paths.jsLint = paths.root.concat(paths.lib);
paths.views = ['src/views/**/*.dust'];
paths.test = paths.tests = ['src/test/**/*.js', '!src/test/ignore*.js'];
paths.watch = paths.lint;

gulp.task('lint', () => gulp.src(paths.jsLint)
  .pipe(plugins.print())
  .pipe(plugins.expectFile(paths.jsLint))
  .pipe(plugins.eslint())
  .pipe(plugins.eslint.format())
  .pipe(plugins.eslint.failAfterError()));

gulp.task('js', () => gulp.src(paths.jsBrowser)
  .pipe(plugins.expectFile(paths.jsBrowser))
  .pipe(plugins.rename((path) => {
    path.basename = path.basename.replace('.browser', ''); // eslint-disable-line no-param-reassign
  }))
  .pipe(gulp.dest('public/js')));

gulp.task('test', ['lint'], () => gulp.src(paths.test)
  .pipe(plugins.expectFile(paths.test))
  .pipe(plugins.mocha({ reporter: 'nyan' })));

gulp.task('view', () => gulp.src(paths.views)
  .pipe(plugins.expectFile(paths.views))
  .pipe(plugins.dust())
  .pipe(plugins.concat('views.min.js'))
  .pipe(gulp.dest('public')));

gulp.task('watch', ['test'], () => gulp.watch(paths.watch, ['test']));

gulp.task('bundle', ['js', 'view']);

gulp.task('develop', ['bundle'], () => {
  plugins.developServer.listen({ path: pkg.main });

  gulp.watch(paths.jsBrowser, () => {
    gulp.start('js', () => {
      plugins.developServer.restart();
    });
  });

  gulp.watch(paths.jsLint, () => {
    gulp.start('lint', () => {
      plugins.developServer.restart();
    });
  });

  return gulp.watch(paths.views, () => {
    gulp.start('view', () => {
      plugins.developServer.restart();
    });
  });
});

gulp.task('default', ['develop']);

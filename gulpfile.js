const gulp = require('gulp');
const pkg = require('./package.json');
const plugins = require('gulp-load-plugins')({ camelize: true });

const paths = {};
paths.root = ['*.js'];
paths.source = ['src/js/**/*.js', '!src/js/edit_admin_xml.browser.js'];
paths.jsBrowser = ['src/js/**/*.browser.js'];
paths.jsLint = paths.root.concat(paths.source);
paths.views = ['src/views/**/*.dust'];
paths.test = paths.tests = ['src/test/**/*.js', '!src/test/ignore*.js'];
paths.watch = paths.lint;

gulp.task('lint', () => gulp.src(paths.jsLint)
  .pipe(plugins.plumber())
  .pipe(plugins.expectFile(paths.jsLint))
  .pipe(plugins.eslint({
    extends: 'eslint:recommended',
    globals: { require: true, module: true },
    rules: { 'no-console': 0 },
    ecmaFeatures: {
      blockBindings: true,
    },
  }))
  .pipe(plugins.eslint.format())
  .pipe(plugins.eslint.failAfterError()));

gulp.task('js', () => gulp.src(paths.jsBrowser)
  .pipe(plugins.expectFile(paths.jsBrowser))
  .pipe(plugins.rename(path => path.basename = path.basename.replace('.browser', '')))
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

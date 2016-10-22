const eslint = require('gulp-eslint');
const expect = require('gulp-expect-file');
const gulp = require('gulp');
const print = require('gulp-print');
const tape = require('gulp-tape');

const paths = {
  lib: [
    'exists/lib/*.js',
    'log/lib/*.js',
    'rename/lib/*.js',
    'resize/lib/*.js',
    'utils/lib/*.js',
  ],
  test: [
    'exists/test/*.js',
    'log/test/*.js',
    'rename/test/*.js',
    'resize/test/*.js',
    'utils/test/*.js',
  ],
  pluginRoot: [
    'gulpfile.js',
  ],
};

function lint(files, configFile) {
  return gulp.src(files)
    .pipe(print())
    .pipe(expect(files))
    .pipe(eslint({ configFile }))
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
}

gulp.task('lint', ['lint-test'], () => lint(paths.lib, '.eslintrc'));
gulp.task('lint-test', () => lint(paths.test.concat(paths.pluginRoot), 'test.eslintrc'));

gulp.task('test', () => {
  const files = paths.test;

  return gulp.src(files)
    .pipe(print())
    .pipe(expect(files))
    .pipe(tape());
});

gulp.task('build', ['lint', 'test']);

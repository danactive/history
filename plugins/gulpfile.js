const eslint = require('gulp-eslint');
const expect = require('gulp-expect-file');
const gulp = require('gulp');
const print = require('gulp-print');
const tape = require('gulp-tape');

const paths = {
  lib: [
    'exists/lib/*.js',
    'rename/lib/*.js'
  ],
  test: [
    'exists/test/*.js',
    'rename/test/*.js'
  ]
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
gulp.task('lint-test', () => lint(paths.test, 'test.eslintrc'));

gulp.task('test', () => {
  const files = paths.test;

  return gulp.src(files)
    .pipe(print())
    .pipe(expect(files))
    .pipe(tape());
});

gulp.task('build', ['lint', 'test']);

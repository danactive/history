const gulp = require('gulp');
const eslint = require('gulp-eslint');
const expect = require('gulp-expect-file');
const tape = require('gulp-tape');

const paths = {
  scripts: ['../../lib/**/*.js'],
  test: ['../../test/**/*.js']
};

gulp.task('lint', () => {
  const files = paths.scripts.concat(paths.test);
  return gulp.src(files)
    .pipe(expect(files))
    .pipe(eslint({ configFile: '.eslintrc.json' }))
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
});

gulp.task('test', () => {
  const files = paths.test;
  return gulp.src(files)
    .pipe(expect(files))
    .pipe(tape());
});

gulp.task('dev', ['lint', 'test']);

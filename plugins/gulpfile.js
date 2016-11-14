const eslint = require('gulp-eslint');
const expect = require('gulp-expect-file');
const gulp = require('gulp');
const print = require('gulp-print');
const tape = require('gulp-tape');
const tapSummary = require('tap-summary');

const paths = {
  lintLibRules: [
    '../*.js', '!../gulpfile.js',
    'album/lib/*.js', 'album/public/*.js', 'album/views/*.jsx',
    'exists/lib/*.js',
    'log/lib/*.js',
    'rename/lib/*.js',
    'resize/lib/*.js',
    'utils/lib/*.js',
  ],
  lintTestRules: [
    '../gulpfile.js',
    'gulpfile.js',
    'album/test/cases.js',
  ],
  test: [
    'album/test/*.js', '!album/test/cases.js',
    'exists/test/*.js',
    'log/test/*.js',
    'rename/test/*.js',
    'resize/test/*.js',
    'utils/test/*.js',
  ],
};

function lint(configFile, ...files) {
  files.forEach((file) => {
    gulp.src(file)
      .pipe(print())
      .pipe(expect(file))
      .pipe(eslint({ configFile }))
      .pipe(eslint.format())
      .pipe(eslint.failAfterError());
  });
}

gulp.task('lint', ['lint-test'], () => lint('../.eslintrc', paths.lintLibRules));
gulp.task('lint-test', () => lint('../test.eslintrc', paths.lintTestRules, paths.test));

gulp.task('test', () => {
  const files = paths.test;
  const options = { reporter: tapSummary({ progress: false }) };

  return gulp.src(files)
    .pipe(print())
    .pipe(expect(files))
    .pipe(tape(options));
});

gulp.task('ci', ['lint', 'test']);

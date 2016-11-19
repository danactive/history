const eslint = require('gulp-eslint');
const expect = require('gulp-expect-file');
const gulp = require('gulp');
const print = require('gulp-print');
const tape = require('gulp-tape');
const tapSummary = require('tap-summary');

const paths = {
  lintLibRules: [
    '../*.js', '!../gulpfile.js',
    '*/lib/*.js', '*/public/*.js', '*/views/*.jsx',
  ],
  lintTestRules: [
    '../gulpfile.js',
    'gulpfile.js',
    'album/test/cases.js',
  ],
  test: [
    '**/test/*.js', '!album/test/cases.js',
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

/* eslint-disable import/no-extraneous-dependencies */

const eslint = require('gulp-eslint');
const flags = require('yargs').argv;
const filter = require('gulp-filter');
const gulp = require('gulp');
const print = require('gulp-print');
const tape = require('gulp-tape');
const tapSummary = require('tap-summary');

const paths = {
  lintLibRules: [
    '../*.js',
    '*/*.js', '*/lib/*.js', '*/public/*.js', '!editAlbum/public/lib/*.js', '*/views/*.jsx',
  ],
  lintTestRules: [
    'gulpfile.js',
    'album/test/cases.js',
  ],
  test: [
    '**/test/*.js', '!album/test/cases.js', '!album/test/react-thumb*.js',
  ],
};

function filterFiles() {
  const plugin = flags.plugin;
  return plugin ? filter([`${plugin}/**/*`]) : filter(['**/*']);
}

function lint(configFile, ...files) {
  files.forEach((file) => {
    gulp.src(file)
      .pipe(filterFiles())
      .pipe(print())
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
    .pipe(filterFiles())
    .pipe(print())
    .pipe(tape(options));
});

/* eslint-disable import/no-extraneous-dependencies */

const eslint = require('gulp-eslint');
const expect = require('gulp-expect-file');
const flags = require('yargs').argv;
const filter = require('gulp-filter');
const gulp = require('gulp');
const nsp = require('gulp-nsp');
const path = require('path');
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
    '**/test/*.js', '!album/test/cases.js', '!album/test/react-thumb.js',
  ],
};

function lint(configFile, ...files) {
  const plugin = flags.plugin;
  const filterFiles = plugin ? filter([`${plugin}/**/*`]) : filter(['**/*']);
  files.forEach((file) => {
    gulp.src(file)
      .pipe(filterFiles)
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
    .pipe(print())
    .pipe(expect(files))
    .pipe(tape(options));
});

gulp.task('nsp', done => nsp({ package: path.join(__dirname, '../', 'package.json') }, done));

gulp.task('ci', ['lint', 'test', 'nsp']);

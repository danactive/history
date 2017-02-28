/* eslint-disable import/no-extraneous-dependencies */

const flags = require('yargs').argv;
const filter = require('gulp-filter');
const gulp = require('gulp');
const print = require('gulp-print');
const tape = require('gulp-tape');
const tapSummary = require('tap-summary');

const paths = {
  test: [
    '*/test/*.spec.js', '!album/test/cases.js', '!album/test/react-thumb*.js',
  ],
};

function filterFiles() {
  const plugin = flags.plugin;
  return plugin ? filter([`${plugin}/**/*`]) : filter(['**/*']);
}

gulp.task('test', () => {
  const files = paths.test;
  const options = { reporter: tapSummary({ progress: false }) };

  return gulp.src(files)
    .pipe(filterFiles())
    .pipe(print())
    .pipe(tape(options));
});

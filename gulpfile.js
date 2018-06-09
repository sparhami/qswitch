var buffer = require('vinyl-buffer');
var cleanCSS = require('gulp-clean-css');
var gulp = require('gulp');
var merge = require('merge-stream');
var rollup = require('rollup-stream');
var source = require('vinyl-source-stream');
var sourcemaps = require('gulp-sourcemaps');
var zip = require('gulp-zip');

function minCss() {
  return gulp.src('src/css/style.css', {base: '.'})
    .pipe(cleanCSS())
}

function bundle() {
  return rollup({
    input: 'src/newtab.js',
    format: 'es',
    sourcemap: true,
  });
}

function js() {
  return bundle()
      .pipe(source('src/newtab.js'))
      .pipe(buffer())
      .pipe(sourcemaps.init({loadMaps: true}))
      .pipe(sourcemaps.write('.'));
}

function copySrcs() {
  return gulp.src([
    'manifest.json',
    'src/**/*.html',
    'src/components/*',
  ], {base: '.'})
}

function compile() {
  return merge(minCss(), js(), copySrcs());
}

function build() {
  return compile()
    .pipe(gulp.dest('out'));
}

function watch() {
  gulp.watch('src/**', ['build']);
}

function dist() {
  return compile()
    .pipe(zip('qswitch.zip'))
    .pipe(gulp.dest('dist'));
}

gulp.task('build', build);
gulp.task('watch', watch);
gulp.task('dist', dist);
gulp.task('default', watch);

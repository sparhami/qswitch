var gulp = require('gulp');
var zip = require('gulp-zip');

var srcs = [
  'manifest.json',
  'node_modules/incremental-dom/dist/incremental-dom.js',
  'src/**/*'
];

gulp.task('pack', function() {
  return gulp.src(srcs, { base: '.' })
    .pipe(zip('qswitch.zip'))
    .pipe(gulp.dest('dist'));
});

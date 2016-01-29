var gulp = require('gulp');
var sourcemaps = require('gulp-sourcemaps');
var coffee = require('gulp-coffee');
var gutil = require('gulp-util');

gulp.task('clean', function() {
	return del('./index.js');
});

gulp.task('coffeescript', function() {
  gulp.src('./index.coffee')
	.pipe(sourcemaps.init())
    .pipe(coffee({bare: true}).on('error', gutil.log))
    .pipe(sourcemaps.write("."))
    .pipe(gulp.dest('.'))
});

gulp.task('watch', function() {
	gulp.watch("./index.coffee", ["coffeescript"]);
});

gulp.task('build', ['coffeescript']);

gulp.task('default', ['coffeescript', 'watch']);

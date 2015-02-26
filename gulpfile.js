var gulp = require('gulp'),
  connect = require('gulp-connect'),
  gulpPlumber = require('gulp-plumber'),
  gulpUtil = require('gulp-util'),
  to5 = require('gulp-babel');

var plumberError = function(err) {
  // handle any streams error and print the error message into console
  gulpUtil.log(err);
  // prevent stopping the tasks
  this.emit('end');
};

gulp.task('compile', function() {
  return gulp.src('./js/**')
    .pipe(gulpPlumber(plumberError))
    .pipe(to5())
    .pipe(gulpPlumber.stop())
    .pipe(gulp.dest('./public'));
});

gulp.task('watch', ['compile'], function() {
  gulp.watch(['./js/**'], ['compile']);
});


gulp.task('connectApp', function() {
  connect.server({
    root: './public',
    port: '3001'
  });
});

gulp.task('default', ['watch', 'connectApp']);
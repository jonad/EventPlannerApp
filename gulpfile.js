'use strict';

var gulp = require('gulp');
var browserSync = require('browser-sync').create();
var minifyCss = require('gulp-minify-css');
var sourcemaps = require('gulp-sourcemaps');
var uglify = require('gulp-uglify');
var imageMin = require('gulp-imagemin');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var os = require('os');
var open = require('gulp-open');
var concat = require('gulp-concat');
var rename = require('gulp-rename');
var del = require('del');

var browser = os.platform() === 'linux' ? 'google-chrome' : (
  os.platform() === 'darwin' ? 'google chrome' : (
  os.platform() === 'win32' ? 'chrome' : 'firefox'));



gulp.task('images', function() {
    gulp.src(['src/img/**/*'])
        .pipe(imageMin())
        .pipe(gulp.dest('dist/img'))
        .pipe(browserSync.stream());
});

gulp.task('clean:dist', function() {
    return del.sync('dist');
});

gulp.task('scripts', function() {



      gulp.src(['src/**/*.js'])
        .pipe(buffer())
        .pipe(sourcemaps.init({loadMaps: true}))
        .pipe(concat('app.js'))
        .pipe(gulp.dest('dist/js'))
        .pipe(rename('app.min.js'))
        .pipe(uglify())
        .pipe(sourcemaps.write('dist/js'))
        .pipe(gulp.dest('dist/js'))
        .pipe(browserSync.stream());
});

gulp.task('styles', function(){
    gulp.src(['src/css/**/*.css'])
            .pipe(sourcemaps.init())
            .pipe(minifyCss())
            .pipe(sourcemaps.write('dist/css'))
            .pipe(gulp.dest('dist/css'))
            .pipe(browserSync.stream());

});

gulp.task('libs', function() {
    gulp.src(['libs/**/*'])
        .pipe(gulp.dest('dist/libs/'));
});

gulp.task('index', function() {
    gulp.src(['src/index.html'])
        .pipe(gulp.dest('dist/'));
});

gulp.task('templates', function() {
    gulp.src(['src/templates/**/*.html'])
        .pipe(gulp.dest('dist/templates/'));
});

gulp.task('default', ['styles', 'images', 'scripts', 'templates', 'libs' , 'index'], function() {
    browserSync.init({
        server:'dist/',
        browser: "google chrome"
    }
    );

    gulp.watch('src/**/*', browserSync.reload);
    gulp.watch('src/css/**/*.css', ['styles']  );
    gulp.watch('src/js/**/*.js', ['scripts']);
    gulp.watch('src/templates/**/*.html', ['templates']);
    gulp.watch('src/index.html', ['index']);
    gulp.watch('lib/**/*', ['lib']);


    gulp.watch('dist/*.html', browserSync.reload());
});

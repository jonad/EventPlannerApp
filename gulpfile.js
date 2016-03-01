var gulp = require('gulp');
var browserSync = require('browser-sync').create();
var minifyCss = require('gulp-minify-css');
var sourcemaps = require('gulp-sourcemaps');
var uglify = require('gulp-uglify');
var imageMin = require('gulp-imagemin');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');




gulp.task('images', function() {
    gulp.src(['src/img/**/*'])
        .pipe(imageMin())
        .pipe(gulp.dest('dist/img'))
        .pipe(browserSync.stream());
});

gulp.task('scripts', function() {
        gulp.src(['src/js/**/*.js'])
        .pipe(sourcemaps.init({loadMaps:true}))
        .pipe(uglify())
        .pipe(sourcemaps.write('dist/js/'))
        .pipe(gulp.dest('dist/js/'))
        .pipe(browserSync.stream());
});

gulp.task('styles', function(){
    gulp.src(['src/css/**/*.css'])
            .pipe(sourcemaps.init())
            .pipe(minifyCss())
            .pipe(sourcemaps.write())
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
        server:'dist/'
    });

    gulp.watch('src/**/*', browserSync.reload);
    gulp.watch('src/css/**/*.css', ['styles']  );
    gulp.watch('src/js/**/*.js', ['scripts']);
    gulp.watch('src/templates/**/*.html', ['templates']);
    gulp.watch('src/index.html', ['index']);
    gulp.watch('lib/**/*', ['lib']);


    gulp.watch('dist/*.html', browserSync.reload());
});

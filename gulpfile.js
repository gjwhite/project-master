/*global require*/
"use strict";
var gulp = require('gulp'),
path = require('path'),
data = require('gulp-data'),
twig = require('gulp-twig'),
prefix = require('gulp-autoprefixer'),
sass = require('gulp-sass'),
plumber = require('gulp-plumber'),
concat = require('gulp-concat'),
rename = require('gulp-rename'),
cache = require('gulp-cache'),
imagemin = require('gulp-imagemin'),
sourcemaps = require('gulp-sourcemaps'),
browserSync = require('browser-sync'),
fs = require('fs');

/*
 * Directories here
 */
var paths = {
   build: './build/',
   sass: './src/scss/',
   css: './build/assets/css/',
   data: './src/data/',
   pattern: './src/components/data/'
};

/**
* Compile .twig files and pass data from json file
* matching file name. index.twig - index.twig.json into HTMLs
*/
gulp.task('twig', function () {
   return gulp.src(['./src/templates/*.twig'])
   // Stay live and reload on error
   .pipe(plumber({
      handleError: function (err) {
      console.log(err);
      this.emit('end');
   }}))
   .pipe(data(function (file) {
        return JSON.parse(fs.readFileSync(paths.data +
        path.basename(file.path) + '.json'));
   }))
   .pipe(twig())
   .on('error', function (err) {
   process.stderr.write(err.message + '\n');
      this.emit('end');
   })
   .pipe(gulp.dest(paths.build))
   .pipe(browserSync.reload({
      stream: true
   }));
});
/**
 * Recompile .twig files and live reload the browser
 */
gulp.task('rebuild', ['twig'], function () {
   // BrowserSync Reload
   browserSync.reload();
});

/**
 * Wait for twig, js and sass tasks, then launch the browser-sync Server
 */
gulp.task('browser-sync', ['sass', 'twig', 'js'], function () {
browserSync({
   server: {
      baseDir: paths.build
   },
   notify: false,
   browser:"google chrome"
   });
});
/**
 * Compile .scss files into build css directory With autoprefixer no
 * need for vendor prefixes then live reload the browser.
 */
gulp.task('sass', function () {
return gulp.src(paths.sass + 'main.scss')
   // Stay live and reload on error
   .pipe(plumber({
      handleError: function (err) {
      console.log(err);
      this.emit('end');
   }}))
   .pipe(sourcemaps.init())
   .pipe(sass({
      includePaths: [paths.sass],
      outputStyle: 'expanded'
   }))
   .pipe(sourcemaps.write())
   .on('error', function (err) {
        sass.logError
        this.emit('end');
   })
   .pipe(prefix(['last 4 versions', '> 1%'], {
      cascade: true
   }))
   .pipe(gulp.dest(paths.css))
   .pipe(browserSync.reload({
        stream: true
    }));
});
/**
 * Compile .js files into build js directory With app.min.js
 */
gulp.task('js', function(){
   return gulp.src('build/assets/js/script.js')
      .pipe(sourcemaps.init())
      .pipe(concat('script.min.js'))
      .pipe(sourcemaps.write())
      .pipe(gulp.dest('build/assets/js'))
      .on('error', function (err) {
         console.log(err.toString());
         this.emit('end');
      });
});
/**
 * Crunch images and port them into build directory
 */
gulp.task('images', function(){
	return gulp.src('src/assets/**/*.+(png|jpg|jpeg|gif|svg)')
	.pipe(cache(imagemin({
		interlaced: true
	  })))
	.pipe(gulp.dest('build/assets'))
});
/**
 * Watch scss files for changes & recompile
 * Watch .twig files run twig-rebuild then reload BrowserSync
 */
gulp.task('watch', function () {
   gulp.watch(paths.build + 'js/script.js', ['js', browserSync.reload]);
   gulp.watch(paths.sass + 'scss/main.scss', ['sass', browserSync.reload]);
   gulp.watch([
       'src/templates/**/*.twig',
       'src/**/**/*.twig',
       'src/scss/**/*.scss',
       'src/data/**/*.twig.json'
     ],
     {cwd:'./'},
     ['rebuild']);
});
// Build task compile sass and twig.
gulp.task('build', ['sass', 'twig']);
/**
 * Default task, running just `gulp` will compile the sass,
 * compile the project site, launch BrowserSync then watch
 * files for changes
 */
gulp.task('default', ['browser-sync', 'watch']);

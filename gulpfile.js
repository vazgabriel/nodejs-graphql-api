/* Importing modules */
const clean = require('gulp-clean');
const gulp = require('gulp');
const ts = require('gulp-typescript');

// Create tsProject
const tsProject = ts.createProject('tsconfig.json');

/**
 * Task scripts
 * This task compile typescript files to javascript
 * Put the result in dist folder
 */
gulp.task('scripts', ['static'], () => {

  const tsResult = tsProject.src()
    .pipe(tsProject());

  return tsResult.js
    .pipe(gulp.dest('dist'));

});

/**
 * Task static
 * This task get json files changes
 * Put the result in dist folder
 */
gulp.task('static', ['clean'], () => {
  return gulp
    .src(['src/**/*.json'])
    .pipe(gulp.dest('dist'));
});

/**
 * Task clean
 * This task clean dist directory removing all files
 */
gulp.task('clean', () => {
  return gulp
    .src('dist')
    .pipe(clean());
});

/**
 * Task build
 * This task clean dist directory, prepare static and scripts files
 * And put result in dist directory
 */
gulp.task('build', ['scripts']);

/**
 * Task watch
 * This task watch change files in src directory, and run build
 */
gulp.task('watch', ['build'], () => {
  return gulp
    .watch(['src/**/*.ts', 'src/**/*.json'], ['build']);
});

/**
 * Define default task
 * Defining task watch as default and run just 'gulp' without pass params
 */
gulp.task('default', ['watch']);

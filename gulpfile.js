"use strict";

const gulp = require('gulp'),
    babel = require('gulp-babel'),
    es2015Angular = require('./es2015-angular.js').plugins;

gulp.task('default', () =>
    gulp.src('test.js')
        .pipe(babel({
            plugins: es2015Angular
        }))
        .pipe(gulp.dest('dist'))
);
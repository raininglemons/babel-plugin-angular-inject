"use strict";

const gulp = require('gulp'),
    babel = require('gulp-babel');

gulp.task('default', () =>
    gulp.src('test.js')
        .pipe(babel({
            presets: ["es2015"],
            plugins: [
                require("./index.js")
            ]
        }))
        .pipe(gulp.dest('dist'))
);
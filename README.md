## babel-plugin-angular-inject
[![Build Status](https://travis-ci.org/raininglemons/babel-plugin-angular-inject.svg?branch=master)](https://travis-ci.org/raininglemons/babel-plugin-angular-inject)


                                         /~\
                                        |oo )     npm install       ☑ Functions
                                        _\=/_      npm test         ☑ Classes
                        ___            /  _  \                      ☑ Arrow functions
                       / ()\          //|/.\|\\                     ☑ Fns from vars
                     _|_____|_       //  \_/  ||                    - Fns from object prop
                    | | === | |     //  |\ /| ||                    ☑   Defined on init
                    |_|  O  |_|     #   \_ _/ #                     ☒   Defined after init
                     ||  O  ||          | | |
                     ||__*__||          | | |
                    |~ \___/ ~|         []|[]
                    /=\ /=\ /=\         | | |
    ________________[_]_[_]_[_]________/_]_[_\_________________________

[credits](http://www.asciimation.co.nz/)

Usage
-----

Add `babel-plugin-angular-inject` as a dev dependency on your project with;

    npm install --save-dev babel-plugin-angular-inject

Add `babel-plugin-angular-inject` as a plugin to your gulp build task:


    "use strict";

    const gulp = require('gulp'),
        babel = require('gulp-babel');

    gulp.task('default', () =>
        gulp.src('test.js')
            .pipe(babel({
                presets: ["es2015"],
                plugins: [
                    require("babel-plugin-angular-inject")
                ]
            }))
            .pipe(gulp.dest('dist'))
    );

Awesome success...
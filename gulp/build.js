'use strict';

var path = require('path');
var gulp = require('gulp');
var conf = require('./conf');

var $ = require('gulp-load-plugins')({
	pattern: ['gulp-*', 'main-bower-files', 'uglify-save-license', 'del']
});

gulp.task('build', ['clean'], function() {

	return gulp.src(path.join(conf.paths.src, '/ng-rule-tip.js'))
		.pipe(gulp.dest(path.join(conf.paths.dist, '/')))
		.pipe($.uglify({
			preserveComments: $.uglifySaveLicense
		})).on('error', conf.errorHandler('Uglify'))
		.pipe($.rename({
			suffix: '.min'
		}))
		.pipe(gulp.dest(path.join(conf.paths.dist, '/')));
});


gulp.task('clean', function() {
	return $.del([path.join(conf.paths.dist, '/')]);
});
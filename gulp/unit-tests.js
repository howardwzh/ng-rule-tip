'use strict';

var path = require('path');
var gulp = require('gulp');
var conf = require('./conf');
var glob = require('glob');

var karma = require('karma');

var pathSrcJs = glob.sync(conf.paths.src + '/*.js');

function runTests(singleRun, done) {
  var reporters = ['progress'];
  var preprocessors = {};

  if (singleRun) {
    pathSrcJs.forEach(function(path) {
      if (path.indexOf('spec') === -1) {
        preprocessors[path] = ['coverage'];
      }
    });
    reporters.push('coverage');
  }

  var localConfig = {
    configFile: path.join(__dirname, '/../karma.conf.js'),
    singleRun: singleRun,
    autoWatch: !singleRun,
    reporters: reporters,
    preprocessors: preprocessors
  };

  if(!singleRun){
    localConfig.browsers=['Chrome'];
  }

  var server = new karma.Server(localConfig, function(failCount) {
    done(failCount ? new Error("Failed " + failCount + " tests.") : null);
  });

  server.start();
}

gulp.task('test', function(done) {
  runTests(true, done);
});

gulp.task('test:auto', function(done) {
  runTests(false, done);
});

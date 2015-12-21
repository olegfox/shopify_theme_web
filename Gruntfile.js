// Generated on 2015-11-18 using
// generator-webapp 0.5.1
'use strict';

// # Globbing
// for performance reasons we're only matching one level down:
// 'test/spec/{,*/}*.js'
// If you want to recursively match all subfolders, use:
// 'test/spec/**/*.js'

module.exports = function (grunt) {

  // Time how long tasks take. Can help when optimizing build times
  require('time-grunt')(grunt);

  // Load grunt tasks automatically
  require('load-grunt-tasks')(grunt);

  // Define the configuration for all the tasks
  grunt.initConfig({

    // Project settings
     cssmin: {
       dist: {
         files: {
           'styles/theme.css': [
             'bower_components/jquery-ui/themes/smoothness/jquery-ui.min.css',
             'bower_components/perfect-scrollbar/css/perfect-scrollbar.min.css',
             'app/styles/*.css'
           ]
         }
       }
     },
     uglify: {
       dist: {
         files: {
           'js/script.js': [
             'bower_components/jquery/dist/jquery.min.js',
             'bower_components/jquery-ui/jquery-ui.min.js',
             'bower_components/masonry/dist/masonry.pkgd.min.js',
             'bower_components/imagesloaded/imagesloaded.pkgd.min.js',
             'bower_components/perfect-scrollbar/js/perfect-scrollbar.jquery.js',
             'bower_components/jquery-sticky/jquery.sticky.js',
             'app/styles/*.js'
           ]
         }
       }
     }
  });

  grunt.registerTask('build', [
    'cssmin',
    'uglify'
  ]);
};

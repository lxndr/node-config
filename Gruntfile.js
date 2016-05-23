'use strict';

module.exports = function (grunt) {
  require('load-grunt-tasks')(grunt);

  grunt.initConfig({
    clean: [
      'build'
    ],

    eslint: {
      files: 'src/**/*.js'
    },

    mochaTest: {
      test: {
        src: ['tests/**/*.js']
      }
    },

    copy: {
      dist: {
        files: [{
          expand: true,
          dest: 'build',
          src: [
            'LICENSE',
            'README.md',
            'package.json'
          ]
        }]
      }
    },

    babel: {
      dist: {
        files: [{
          expand: true,
          cwd: 'src',
          src: [
            '**/*.js',
            '!providers/localStorage.js',
            '!index.browser.js'
          ],
          dest: 'build/lib'
        }]
      },
      options: {
        plugins: [
          'transform-es2015-modules-commonjs'
        ]
      }
    },

    browserify: {
      dist: {
        files: {
          'build/dist/config.js': ['src/index.browser.js']
        }
      },
      options: {
        browserifyOptions: {
          standalone: 'config'
        },
        transform: [
          ['babelify', {
            presets: ['es2015'],
            plugins: [
              'lodash',
              'transform-runtime'
            ]
          }]
        ]
      }
    },

    uglify: {
      dist: {
        files: {
          'build/dist/config.min.js': ['build/dist/config.js']
        }
      },
      options: {
        screwIE8: true,
        compress: {
          dead_code: true
        }
      }
    }
  });

  grunt.registerTask('default', [
    'copy',
    'babel',
    'browserify',
    'uglify'
  ]);

  grunt.registerTask('lint', ['eslint']);
  grunt.registerTask('test', ['mochaTest']);
};

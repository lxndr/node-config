'use strict';
const webpack = require('webpack');

module.exports = function (grunt) {
  require('load-grunt-tasks')(grunt);

  grunt.initConfig({
    clean: [
      'dist',
      'lib'
    ],

    eslint: {
      files: 'src/**/*.js'
    },

    mochaTest: {
      test: {
        src: 'tests/*.js',
        options: {
          reporter: 'spec',
          require: 'tests/support/node'
        }
      }
    },

    babel: {
      dist: {
        files: [{
          expand: true,
          cwd: 'src',
          src: '**/*.js',
          dest: 'lib'
        }]
      },
      options: {
        plugins: [
          'transform-es2015-modules-commonjs'
        ]
      }
    },

    webpack: {
      dist: {
        entry: './src/index.browser.js',
        output: {
          path: 'dist',
          filename: 'config.js',
          libraryTarget: 'umd'
        },
        progress: true,
        stats: {
          errorDetails: true
        },
        module: {
          loaders: [{
            test: /\.js$/,
            exclude: /(node_modules|bower_components)/,
            loader: 'babel',
            query: {
              presets: ['es2015'],
              plugins: [
                'lodash',
                'transform-runtime'
              ]
            }
          }]
        },
        plugins: [
          new webpack.NoErrorsPlugin(),
          new webpack.optimize.DedupePlugin()
        ]
      }
    },

    uglify: {
      dist: {
        files: {
          'dist/config.min.js': 'dist/config.js'
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
    'babel',
    'webpack',
    'uglify'
  ]);

  grunt.registerTask('lint', ['eslint']);
  grunt.registerTask('test', ['mochaTest']);
};

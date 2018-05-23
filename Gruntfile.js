'use strict';
const path = require('path');

module.exports = function (grunt) {
  require('load-grunt-tasks')(grunt);

  grunt.initConfig({
    clean: {
      files: ['dist', 'lib']
    },

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
        }],
        options: {
          plugins: [
            'transform-es2015-modules-commonjs',
            ['transform-runtime', {
              polyfill: false
            }]
          ]
        }
      }
    },

    webpack: {
      es5: {
        entry: path.resolve(__dirname, 'src/index.browser.js'),
        output: {
          path: path.resolve(__dirname, 'dist'),
          filename: 'config.js',
          libraryTarget: 'umd'
        },
        mode: 'production',
        module: {
          rules: [{
            test: /\.js$/,
            exclude: [
              path.resolve(__dirname, 'node_modules')
            ],
            use: {
              loader: 'babel-loader',
              options: {
                babelrc: false,
                compact: false,
                presets: ['es2015'],
                plugins: [
                  require('babel-plugin-lodash')
                ]
              }
            }
          }]
        }
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
    'clean',
    'babel',
    'webpack',
    'uglify'
  ]);

  grunt.registerTask('lint', ['eslint']);
  grunt.registerTask('test', ['mochaTest']);
};

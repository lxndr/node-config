const path = require('path');

module.exports = function (grunt) {
  require('load-grunt-tasks')(grunt); // eslint-disable-line global-require

  grunt.initConfig({
    clean: {
      files: ['dist', 'lib'],
    },

    eslint: {
      files: 'src/**/*.js',
    },

    mochaTest: {
      test: {
        src: 'tests/*.js',
        options: {
          reporter: 'spec',
          require: 'tests/support/node',
        },
      },
    },

    babel: {
      dist: {
        files: [{
          expand: true,
          cwd: 'src',
          src: '**/*.js',
          dest: 'lib',
        }],
        options: {
          presets: [
            ['env', {
              target: {
                node: 6,
              },
            }],
          ],
        },
      },
    },

    webpack: {
      es5: {
        entry: path.resolve(__dirname, 'src/index.browser.js'),
        output: {
          path: path.resolve(__dirname, 'dist'),
          filename: 'config.js',
          libraryTarget: 'umd',
        },
        mode: 'production',
        module: {
          rules: [{
            test: /\.js$/,
            exclude: [
              path.resolve(__dirname, 'node_modules'),
            ],
            use: {
              loader: 'babel-loader',
              options: {
                babelrc: false,
                compact: false,
                presets: ['es2015'],
                plugins: [
                  'lodash',
                ],
              },
            },
          }],
        },
      },
    },

    uglify: {
      dist: {
        files: {
          'dist/config.min.js': 'dist/config.js',
        },
      },
      options: {
        screwIE8: true,
        compress: {
          dead_code: true,
        },
      },
    },
  });

  grunt.registerTask('default', [
    'clean',
    'babel',
    'webpack',
    'uglify',
  ]);

  grunt.registerTask('lint', ['eslint']);
  grunt.registerTask('test', ['mochaTest']);
};

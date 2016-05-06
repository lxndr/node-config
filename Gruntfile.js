'use strict';

module.exports = function (grunt) {
  function formatBuiltinProviders(platform) {
    const list = {
      node: [
        'object',
        'env',
        'directory',
        'file'
      ],
      browser: [
        'object',
        'localStorage'
      ]
    };

    return list[platform].map(x => `Config.register('object', require('./providers/${x}').default);\n`).join('');
  }

  require('load-grunt-tasks')(grunt);

  grunt.initConfig({
    clean: [
      'build'
    ],

    eslint: {
      files: 'src/**/*.js'
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
          src: '**/*.js',
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
          'build/dist/config.js': ['src/index.js']
        }
      },
      options: {
        standalone: 'config',
        transform: [
          ['babelify', {
            presets: ['es2015'],
            plugins: [
              'lodash'
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
};

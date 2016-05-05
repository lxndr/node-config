module.exports = function (grunt) {
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-babel');
  grunt.loadNpmTasks('grunt-eslint');

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
      options: {
        plugins: [
          'transform-es2015-modules-commonjs'
        ]
      },
      dist: {
        files: [{
          expand: true,
          cwd: 'src',
          src: '**/*.js',
          dest: 'build'
        }]
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

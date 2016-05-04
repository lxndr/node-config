const gulp = require('gulp');
const uglify = require('gulp-uglify');
const gutil = require('gulp-util');
const streamify = require('gulp-streamify');
const browserify = require('browserify');
const source = require('vinyl-source-stream');
const babel = require('gulp-babel');
const eslint = require('gulp-eslint');

gulp.task('build', ['build-browser', 'build-node']);

/*
 * Building node dist.
 */
gulp.task('build-node', () => {
  gulp.src('src/**/*.js')
    .pipe(babel({
      plugins: [
        'transform-es2015-modules-commonjs'
      ]
    }))
    .pipe(gulp.dest('build'));
});

/*
 * Building browser dist.
 */
gulp.task('build-browser', () => {
  const b = browserify({
    standalone: 'config',
    entries: './src/index.js'
  }).transform('babelify', {
    presets: ['es2015'],
    plugins: [
      'lodash'
    ]
  });

  let s = b.bundle()
    .pipe(source('config.js'));

  if (false) {
    s = s.pipe(streamify(uglify({
      compress: {
        /* eslint-disable camelcase */
        dead_code: true
        /* eslint-enable camelcase */
      }
    })));
  }

  s = s.on('error', gutil.log)
    .pipe(gulp.dest('build/dist'));
});

/*
 * Linting
 */
gulp.task('lint', () => {
  return gulp.src(['src/**/*.js', 'tests/**/*.js', 'gulpfile.js'])
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
});

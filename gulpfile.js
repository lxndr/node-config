const gulp = require('gulp');
const uglify = require('gulp-uglify');
const gutil = require('gulp-util');
const streamify = require('gulp-streamify');
const browserify = require('browserify');
const source = require('vinyl-source-stream');
const babel = require('gulp-babel');

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
    presets: ['es2015']
  });

  b.bundle()
    .pipe(source('config.js'))
/*
    .pipe(streamify(uglify({
      compress: {
        dead_code: true
      }
    })))
*/
    .on('error', gutil.log)
    .pipe(gulp.dest('build/dist'));
});

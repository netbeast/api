var gulp = require('gulp')
var plugins = require('gulp-load-plugins')()

var bgTask

var manifest = require('./package.json')
process.env.VERSION = manifest.version

gulp.task('default', ['serve'], function () {
  plugins.livereload.listen()
})

gulp.task('serve', function () {
  plugins.nodemon({
    script: './index.js',
    watch: ['./index.js', '*']
  })
})

gulp.task('start-bg', bgTask = plugins.bg('beast', 'start'))
gulp.task('start-echo-server', bgTask = plugins.bg('echo-server', '40123'))

gulp.task('test', ['start-bg', 'start-echo-server'], function () {
  // make test
  return gulp.src(['./test/*.js'], { read: false })
  .pipe(plugins.wait(3000))
  .pipe(plugins.mocha({ reporter: 'spec', bail: true }))
  .pipe(gulp.dest(''))
  .once('end', function () {
    bgTask.setCallback(function () { process.exit(0) })
    bgTask.stop(0)
  })
  .once('error', function () {
    bgTask.setCallback(function () { process.exit(0) })
    bgTask.stop(0)
  })
})

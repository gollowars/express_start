import gulp from 'gulp'
import nodemon from 'nodemon'
import browserSync from 'browser-sync'
import appConfig from 'config'
import lp from 'gulp-load-plugins'
const $ = lp()
import path from 'path'
import autoprefixer from 'gulp-autoprefixer'
import webpack from 'webpack'
import webpackStream from 'webpack-stream'
import runSequcence from 'run-sequence'

gulp.task('default',['server','stylus','webpack','watch'],function(){
  console.log('Gulp Default')
  console.log(path.join(appConfig.staticPath,"css/**/*.css"))
})

gulp.task('server',['serve'],function(){
  browserSync.init({
    proxy: 'http://localhost:'+appConfig.port,
    files: ["public/**/*.*",'./server/views/**/*.jade'],
    port: appConfig.browserSyncPort, 
    open: false
  })
})

gulp.task('serve',function(cb){
  var started = false

  return nodemon({
    script: './server/app.js'
  }).on('start', () => {
    console.log("restart server")
    if (!started) {
      cb();
      started = true; 
    } 
  })
})

// develop

gulp.task('webpack', () => {
  let config = {
    watch: true,
    entry: {
      main: './source/js/main.js'
    },
    output: {
      filename: '[name].js'
    },
    module: {
      loaders:[
        {test: /\.js$/, exclude: /node_modules|modules/, loaders: ['babel-loader', 'eslint-loader']},
        {test: /\.(glsl|vs|fs)$/, loader: 'webpack-glsl'}
      ]
    },
    worker: {
      output: {
        path: appConfig.staticPath,
        filename: '[id].worker.js'
      }
    },
    eslint: {
      configFile: './.eslintrc',
      ignorePath: './.eslintignore'
    },
    plugins: [
      // new webpack.optimize.UglifyJsPlugin()
    // ],
    ],
    devtool: ''
  }

  let env = appConfig.env
  if (env == 'prod') {
    config.watch = false
    config.plugins = [
      new webpack.optimize.UglifyJsPlugin(),
      new webpack.optimize.DedupePlugin()
    ]
  } else {
    config.devtool = 'inline-source-map'
  }

  return gulp.src('')
    // .pipe(gulpWebpack(config))
    .pipe($.plumber())

    .pipe(webpackStream(config, null, (err, stats) => {
      if (!err) {
        console.log(stats.toString())
        browserSync.reload()
      }
    }))
    .pipe(gulp.dest(appConfig.staticPath + 'js/'))
})

gulp.task('stylus', () => {
  return gulp.src(['./source/stylus/**/*.styl','!./source/stylus/**/_*.styl'])
    .pipe($.stylus({
      "include css": true
    }))
    .pipe($.autoprefixer({
      browsers: ["Android >= 4", "ios_saf >= 8"]
    }))
    .pipe(gulp.dest(appConfig.staticPath + 'css/'))
    .pipe(browserSync.stream())
})


gulp.task('watch',function(){
  gulp.watch('./source/stylus/**/*.styl',['stylus'])
  gulp.watch('./public/**/*.js', browserSync.reload)
})
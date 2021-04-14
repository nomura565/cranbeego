const gulp = require( 'gulp' );
const pug = require( 'gulp-pug' );
const rename = require('gulp-rename');
const sass = require('gulp-sass');
const autoprefixer =require('gulp-autoprefixer');
const cssmin = require('gulp-cssmin');
const notify = require('gulp-notify');
const plumber = require('gulp-plumber');
const browsersync = require('browser-sync');
const webpackStream = require("webpack-stream");
const webpack = require("webpack");
// webpackの設定ファイルの読み込み
const webpackConfig = require("./webpack.config");
const config = require('./conf/config.json');
var runSequence = require('run-sequence');

const paths = {
    src: './'+ config.baseDir + '/',
    dest: './'+ config.distDir + '/',
    htmlsrc: './src/pug/',
    htmlDest: './views/'
  };

var fs = require("fs");
var data = require("gulp-data");

gulp.task("js", () => {
  // ☆ webpackStreamの第2引数にwebpackを渡す☆
  return webpackStream(webpackConfig, webpack)
    .pipe(plumber({
        errorHandler: notify.onError("Error: <%= error.message %>")
    }))
    .pipe(gulp.dest(paths.dest+config.jsDir+"/"));
});

gulp.task( 'html', function() {
  return gulp
    .src([ paths.htmlsrc + '**/*.pug', '!'+paths.htmlsrc + '**/_*.pug' ])
    .pipe(data( file => {
        var json = {};
        json.config = JSON.parse(fs.readFileSync("./conf/config.json"));
        json.manifest = JSON.parse(fs.readFileSync(paths.dest+config.jsDir+"/manifest.json"));
        return json;
    }))
    .pipe(plumber({
        errorHandler: notify.onError("Error: <%= error.message %>")
      }))
    .pipe(pug({
      pretty: true
    }))
    .pipe(rename({
        extname: '.tpl' //コンパイル後tpl拡張子で出力したい場合使用
    }))
    .pipe( gulp.dest( paths.htmlDest ) );
});

gulp.task('css', function() {
    return gulp.src([
      paths.src + '**/*.scss',
      '!' + paths.src + '**/_*.scss',
      '!' + paths.src + 'node_modules/**/*.scss'
    ])
    .pipe(plumber({
      errorHandler: notify.onError("Error: <%= error.message %>")
    }))
    .pipe(sass({
      outputStyle: 'expanded'
    }))
    .pipe(autoprefixer({
        overrideBrowserslist: 'last 2 versions'
    }))
    //.pipe(cssmin())
    .pipe(gulp.dest(paths.dest))
  });

gulp.task('browser-sync', function (done) {
    browsersync({
      server: { //ローカルサーバー起動
          baseDir: paths.dest
    }});
    done();
  });

gulp.task('watch', function () {
    const reload = () => {
      browsersync.reload(); //リロード
    };
    gulp.watch(paths.src + '**/*.scss').on('change', gulp.series('css', reload));
    gulp.watch(paths.src + '**/*.pug').on('change', gulp.series('html', reload));
    gulp.watch(paths.src + '**/*.js').on('change', gulp.series('js', reload));
    gulp.watch(paths.src + '**/*.ts').on('change', gulp.series('js', reload));
    //gulp.watch(paths.src + '**/*.vue').on('change', gulp.series('js', reload));
    //gulp.watch(paths.src + '/images/**/*').on('change', gulp.series('image', reload));
});

gulp.task('all', gulp.series('css', 'js', 'html'));
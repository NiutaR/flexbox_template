const { task, series, parallel, src, dest, watch } = require('gulp');
const sass = require('gulp-sass');
const browserSync = require('browser-sync');
const notify = require('gulp-notify');
const cssnano = require('cssnano');
const rename = require('gulp-rename');
const postcss = require('gulp-postcss');
const csscomb = require('gulp-csscomb');
const autoprefixer = require('autoprefixer');
const mqpacker = require('css-mqpacker');
const sortCSSmq = require('sort-css-media-queries');
const uglify = require('gulp-uglify');
const terser = require('gulp-terser');
const concat = require('gulp-concat');

const PATH = {
  scssFile: './assets/scss/style.scss',
  scssFiles: './assets/scss/**/*.scss',
  scssFolder: './assets/scss',
  cssFolder: './assets/css',
  htmlFiles: './*.html',
  jsFiles: [
    './assets/js/**/*.js',
    '!./assets/js/**/*.min.js',
    '!./assets/js/**/all.js',
  ],
  jsFolder: './assets/js',
  jsDestFolder: './dest/js',
  jsBundleName: 'all.js',
};

const PLUGINS = [
  autoprefixer({
    overrideBrowserslist: ['last 5 versions', '> 1%'],
    cascade: true,
  }),
  mqpacker({ sort: sortCSSmq }),
];

function scss() {
  return src(PATH.scssFile)
    .pipe(sass({ outputStyle: 'expanded' }).on('error', sass.logError))
    .pipe(postcss(PLUGINS))
    .pipe(csscomb('./.csscomb.json'))
    .pipe(dest(PATH.cssFolder))
    .pipe(
      notify({ message: ' ------------------ SCSS compiled!', sound: false })
    )
    .pipe(browserSync.reload({ stream: true }));
}

function scssDev() {
  return src(PATH.scssFile, { sourcemaps: true })
    .pipe(sass({ outputStyle: 'expanded' }).on('error', sass.logError))
    .pipe(postcss(PLUGINS))
    .pipe(dest(PATH.cssFolder, { sourcemaps: true }))
    .pipe(
      notify({ message: ' ------------------ SCSS compiled!', sound: false })
    )
    .pipe(browserSync.reload({ stream: true }));
}

function scssMin() {
  const pluginsExtended = PLUGINS.concat([cssnano({ preset: 'default' })]);

  return src(PATH.scssFile)
    .pipe(sass({ outputStyle: 'expanded' }).on('error', sass.logError))
    .pipe(csscomb('./.csscomb.json'))
    .pipe(postcss(pluginsExtended))
    .pipe(rename({ suffix: '.min' }))
    .pipe(dest(PATH.cssFolder))
    .pipe(
      notify({ message: ' ------------------ MIN css builded!', sound: false })
    )
    .pipe(browserSync.reload({ stream: true }));
}

function comb() {
  return src(PATH.scssFiles)
    .pipe(csscomb('./.csscomb.json'))
    .on(
      'error',
      notify.onError(function (error) {
        return 'File: ' + error.message;
      })
    )
    .pipe(dest(PATH.scssFolder));
}

function concatJs() {
  return src(PATH.jsFiles)
    .pipe(concat(PATH.jsBundleName))
    .pipe(dest(PATH.jsFolder));
}

function uglifyJs() {
  return src(PATH.jsFiles)
    .pipe(
      uglify({
        toplevel: true,
        output: { quote_style: 3 },
      })
    )
    .pipe(rename({ suffix: '.min' }))
    .pipe(dest(PATH.jsFolder));
}

function uglifyEs6() {
  return src(PATH.jsFiles)
    .pipe(terser({
      toplevel: true,
      output: { quote_style: 3 }
    }))
    .pipe(rename({ suffix: '.min' }))
    .pipe(dest(PATH.jsFolder));
}

function syncInit() {
  browserSync({
    server: {
      baseDir: './',
    },
    notify: false,
  });
}

async function sync() {
  browserSync.reload();
}

function watchFiles() {
  syncInit();
  watch(PATH.scssFiles, series(scss, scssMin));
  watch(PATH.htmlFiles, sync);
  watch(PATH.jsFiles, sync);
}

task('concat', concatJs);
task('uglify', uglifyJs);
task('es6', uglifyEs6);
task('comb', comb);
task('min', scssMin);
task('dev', scssDev);
task('scss', series(scss, scssMin));
task('watch', watchFiles);
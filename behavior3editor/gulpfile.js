// GULP MODULES ===============================================================
var gulp = require('gulp');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var cleanCSS = require('gulp-clean-css');
var minifyHTML = require('gulp-minify-html');
var connect = require('gulp-connect');
var less = require('gulp-less');
var jshint = require('gulp-jshint');
var foreach = require("gulp-foreach");
var zip = require("gulp-zip");
var packager = require('electron-packager');
var templateCache = require('gulp-angular-templatecache');
var replace = require('gulp-replace');
var stylish = require('jshint-stylish');
var exec = require('child_process').exec;
var fs = require('fs');
var rimraf = require('rimraf');
var merge = require('merge-stream');
var del = require('del');
var path = require('path');

// VARIABLES ==================================================================
var project = JSON.parse(fs.readFileSync('package.json', 'utf8'));
var build_version = project.version;
var build_date = (new Date()).toISOString().replace(/T.*/, '');

// FILES ======================================================================
var vendor_js = [
  'src/assets/libs/createjs.min.js',
  'src/assets/libs/creatine-1.0.0.min.js',
  'src/assets/libs/behavior3js-0.1.0.min.js',
  'src/assets/libs/mousetrap.min.js',
  'bower_components/jquery/dist/jquery.min.js',
  'bower_components/bootstrap/dist/js/bootstrap.min.js',
  'bower_components/angular/angular.min.js',
  'bower_components/angular-ui-router/release/angular-ui-router.min.js',
  'bower_components/angular-bootstrap/ui-bootstrap-tpls.min.js',
  'bower_components/angular-animate/angular-animate.min.js',
  'bower_components/mousetrap/mousetrap.min.js',
  'bower_components/sweetalert/dist/sweetalert.min.js',
  'src/assets/js/snap.svg-min.js',
  'src/assets/js/behavior3js-0.1.0.min.js',
  'src/assets/js/behavior3editor-0.1.0.min.js',
  'lib/tine/tine.js'
];
var vendor_css = [
  'bower_components/bootstrap/dist/css/bootstrap.min.css',
  'bower_components/font-awesome/css/font-awesome.min.css',
  'bower_components/sweetalert/dist/sweetalert.css'
];
var vendor_fonts = [
  'bower_components/fontawesome/fonts/*',
  'src/assets/fonts/**/*',
];

var preload_js = [
  'src/assets/js/preload.js',
];

var preload_css = [
  'bower_components/fontawesome/css/font-awesome.min.css',
  'src/assets/css/preload.css',
];

var app_js = [
  'src/editor/namespaces.js',
  'src/editor/utils/*.js',
  'src/editor/**/*.js',
  'src/app/app.js',
  'src/app/app.routes.js',
  'src/app/app.controller.js',
  'src/app/**/*.js',
  'src/start.js',
];
var app_less = [
  'src/assets/less/index.less',
];
var app_imgs = [
  'src/assets/imgs/**/*',
];
var app_html = [
  'src/app/**/*.html'
];
var app_entry = [
  'src/index.html',
  'src/package.json',
  'src/desktop.js',
]

// TASKS (VENDOR) =============================================================
function vendorJs() {
  return gulp.src(vendor_js, { allowEmpty: true })
    .pipe(uglify())
    .pipe(concat('vendor.min.js'))
    .pipe(gulp.dest('build/js'));
}

function vendorCss() {
  return gulp.src(vendor_css, { allowEmpty: true })
    .pipe(cleanCSS())
    .pipe(concat('vendor.min.css'))
    .pipe(gulp.dest('build/css'));
}

function vendorFonts() {
  return gulp.src(vendor_fonts)
    .pipe(gulp.dest('build/fonts'));
}

// TASKS (PRELOAD) ============================================================
function preloadJs() {
  return gulp.src(preload_js)
    .pipe(uglify())
    .pipe(concat('preload.min.js'))
    .pipe(gulp.dest('build/js'))
    .pipe(connect.reload());
}

function preloadCss() {
  return gulp.src(preload_css)
    .pipe(cleanCSS())
    .pipe(concat('preload.min.css'))
    .pipe(gulp.dest('build/css'))
    .pipe(connect.reload());
}

// TASKS (APP) ================================================================
function appJsDev() {
  return gulp.src(app_js)
    .pipe(jshint())
    .pipe(jshint.reporter(stylish))
    .pipe(replace('[BUILD_VERSION]', build_version))
    .pipe(replace('[BUILD_DATE]', build_date))
    .pipe(concat('app.min.js'))
    .pipe(gulp.dest('build/js'))
    .pipe(connect.reload());
}

function appJsBuild() {
  return gulp.src(app_js)
    .pipe(jshint())
    .pipe(jshint.reporter(stylish))
    .pipe(replace('[BUILD_VERSION]', build_version))
    .pipe(replace('[BUILD_DATE]', build_date))
    .pipe(uglify())
    .pipe(concat('app.min.js'))
    .pipe(gulp.dest('build/js'))
    .pipe(connect.reload());
}

function appLess() {
  return gulp.src(app_less)
    .pipe(less())
    .pipe(cleanCSS())
    .pipe(concat('app.min.css'))
    .pipe(gulp.dest('build/css'))
    .pipe(connect.reload());
}

function appImgs() {
  return gulp.src(app_imgs)
    .pipe(gulp.dest('build/imgs'));
}

function appHtml() {
  return gulp.src(app_html)
    .pipe(minifyHTML({ empty: true }))
    .pipe(replace('[BUILD_VERSION]', build_version))
    .pipe(replace('[BUILD_DATE]', build_date))
    .pipe(gulp.dest('build'))
    .pipe(templateCache('templates.min.js', {
      standalone: true,
      moduleSystem: 'IIFE',
      transformUrl: function (url) {
        return url.replace('src/app/', '');
      }
    }))
    .pipe(gulp.dest('build/js'))
    .pipe(connect.reload());
}

function appEntry() {
  return gulp.src(app_entry)
    // .pipe(minifyHTML({empty:true})) 
    .pipe(replace('[BUILD_VERSION]', build_version))
    .pipe(replace('[BUILD_DATE]', build_date))
    .pipe(gulp.dest('build'))
    .pipe(connect.reload());
}

// TASKS (SERVER) =============================================================
function startServer() {
  connect.server({
    root: 'build',
    livereload: true,
    port: 8000,
  });
}

function watch() {
  gulp.watch(app_js, appJsDev);
  gulp.watch(app_less, appLess);
  gulp.watch(app_html, appHtml);
  gulp.watch(app_entry, appEntry);
  gulp.watch(preload_js, preloadJs);
  gulp.watch(preload_css, preloadCss);
}

// TASKS (ELECTRON) ===========================================================
function cleanDist(cb) {
  return del(['dist/**', '.temp-dist/**'], cb);
}

function electronBuild(done) {
  const packager = require('electron-packager');
  const path = require('path');

  // 检查 icon.ico 是否存在
  let iconPath = null;
  try {
    const fs = require('fs');
    const possibleIconPaths = ['icon.ico', 'src/icon.ico', 'build/icon.ico'];

    for (const p of possibleIconPaths) {
      if (fs.existsSync(p)) {
        iconPath = path.resolve(p);
        break;
      }
    }

    if (!iconPath) {
      console.warn('警告: 找不到图标文件，将使用默认图标');
    }
  } catch (e) {
    console.warn('检查图标文件时出错:', e);
  }

  const options = {
    dir: path.resolve('build'),
    name: 'behavior3editor',
    platform: ['win32'],
    arch: ['ia32', 'x64'],
    electronVersion: '22.0.0',
    out: path.resolve('dist'),
    overwrite: true
  };

  if (iconPath) {
    options.icon = iconPath;
  }

  console.log('开始打包应用...');
  console.log('选项:', options);

  // 使用 Promise API
  packager(options)
    .then(appPaths => {
      console.log('应用打包成功:', appPaths);
      done(); // 标记任务完成
    })
    .catch(err => {
      console.error('打包应用时出错:', err);
      done(err); // 标记任务失败
    });
}

function electronZip() {
  return gulp.src('.temp-dist/*', { allowEmpty: true })
    .pipe(foreach(function (stream, file) {
      var fileName = file.path.substr(file.path.lastIndexOf("/") + 1);
      return gulp.src('.temp-dist/' + fileName + '/**/*', { allowEmpty: true })
        .pipe(zip(fileName + '.zip'))
        .pipe(gulp.dest('./dist'));
    }));
}

// 定义任务组合
const vendor = gulp.parallel(vendorJs, vendorCss, vendorFonts);
const preload = gulp.parallel(preloadJs, preloadCss);
const appDev = gulp.parallel(appJsDev, appLess, appHtml, appImgs, appEntry);
const appBuild = gulp.parallel(appJsBuild, appLess, appHtml, appImgs, appEntry);

// 主要任务
function nwTask(cb) {
  // 首先检查是否安装了 nw.js
  var isNwInstalled = false;
  try {
    // 检查全局安装
    require('child_process').execSync('nw --version', { stdio: 'ignore' });
    isNwInstalled = true;
  } catch (e) {
    console.log('全局未安装 NW.js，尝试使用本地安装...');
  }

  if (isNwInstalled) {
    // 使用全局安装的 nw
    exec('cd build && nw .', function (err) {
      if (err) console.error(err);
      cb();
    });
  } else {
    // 提示安装 nw.js
    console.error('错误: 未找到 NW.js。请先安装它：');
    console.error('npm install -g nw');
    console.error('或者');
    console.error('npm install --save-dev nw');
    cb(new Error('NW.js not found'));
  }
}

// 添加 GitHub Pages 部署任务
function ghPages() {
  return gulp.src('build/**/*')
    .pipe(gulp.dest('docs'));
}

// 修复GitHub Pages的基本URL
function fixBaseHref() {
  return gulp.src('docs/index.html')
    .pipe(replace('<base href="/">', '<base href="/behavior3editor/">'))
    .pipe(gulp.dest('docs/'));
}

// 创建.nojekyll文件
function createNojekyll() {
  return gulp.src('*', { read: false, allowEmpty: true })
    .pipe(gulp.dest('docs/.nojekyll'));
}

// 添加模板缓存任务
function appTemplates() {
  return gulp.src(app_html)
    .pipe(minifyHTML({ empty: true }))
    .pipe(templateCache('templates.js', {
      module: 'app',
      root: 'pages/'
    }))
    .pipe(gulp.dest('build/js'));
}

// 导出任务
exports.vendor = vendor;
exports.preload = preload;
exports.nw = nwTask;

// build 任务: 先构建 vendor 和 preload，然后构建生产环境应用
exports.build = gulp.series(
  gulp.parallel(vendor, preload),
  appBuild
);

// dev 任务: 先构建 vendor 和 preload，然后构建开发环境应用
exports.dev = gulp.series(
  gulp.parallel(vendor, preload),
  appDev
);

// serve 任务: 运行开发构建，启动服务器并监视变化
exports.serve = gulp.series(
  exports.dev,
  gulp.parallel(startServer, watch)
);

// dist 任务: 构建生产版本，清理目录，构建 electron 应用并打包
exports.dist = gulp.series(
  exports.build,
  cleanDist,
  electronBuild,
  electronZip
);

// 修改 GitHub Pages 部署任务定义
exports.github = gulp.series(
  gulp.parallel(vendorJs, vendorCss, vendorFonts, preloadJs, preloadCss),
  gulp.parallel(appJsBuild, appLess, appTemplates, appImgs, appEntry),
  ghPages,
  fixBaseHref,
  createNojekyll
);

// 默认任务
exports.default = exports.serve;

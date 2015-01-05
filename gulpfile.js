/* jshint node:true */
'use strict';
// generated on 2014-12-27 using generator-gulp-webapp 0.2.0
var gulp = require('gulp');
var $ = require('gulp-load-plugins')();

gulp.task('styles_theme', $.folders('app/styles', function(fld) {
  console.log(fld);
  return gulp.src('app/styles/demo.scss')
    .pipe($.replace(/theme/g, fld))
    .pipe($.rename(fld + '.scss'))
    .pipe(gulp.dest('.tmp/styles/'));
}));

gulp.task('styles', ['styles_theme'], function() {
  return gulp.src('.tmp/styles/*.scss')
    .pipe($.plumber())
    .pipe($.rubySass({
      trace: true,
      style: 'expanded'
    }))
    .pipe($.autoprefixer({browsers: ['last 1 version']}))
    .pipe(gulp.dest('.tmp/styles/'));
});

var theme_dct = {
  "cerulean": "A calm blue sky",
  "cosmo": "An ode to Metro",
  "cyborg": "Jet black and electric blue",
  "darkly": "Flatly in night mode",
  "flatly": "Flat and modern",
  "journal": "Crisp like a new sheet of paper",
  "lumen": "Light and shadow",
  "paper": "Material is the metaphor",
  "readable": "Optimized for legibility",
  "sandstone": "A touch of warmth",
  "simplex": "Mini and minimalist",
  "slate": "Shades of gunmetal gray",
  "spacelab": "Silvery and sleek",
  "superhero": "The brave and the blue",
  "united": "Ubuntu orange and unique font",
  "yeti": "A friendly foundation",
  "default": "bootstrap default"
};

gulp.task('templates_demo', $.folders('app/styles/', function(fld) {
  return gulp.src('app/demo.jade')
    .pipe($.jade({
      pretty: true,
      data: {
        "title": fld,
        "description": theme_dct[fld]
      }
    }))
    .pipe($.rename( fld + ".html"))
    .pipe(gulp.dest('.tmp'));
}));

gulp.task('templates', ['templates_demo'], function() {
  return gulp.src('app/index.jade')
    .pipe($.jade({
      pretty: true
    }))
    .pipe(gulp.dest('.tmp'));
});

gulp.task('jshint', function () {
  return gulp.src('app/scripts/**/*.js')
    .pipe($.jshint())
    .pipe($.jshint.reporter('jshint-stylish'))
    .pipe($.jshint.reporter('fail'));
});

gulp.task('html', ['templates', 'styles'], function () {
  var lazypipe = require('lazypipe');
  var cssChannel = lazypipe()
    .pipe($.csso)
    .pipe($.replace, 'bower_components/bootstrap-sass-official/assets/fonts/bootstrap','fonts');
  var assets = $.useref.assets({searchPath: '{.tmp,app}'});

  return gulp.src('.tmp/*.html')
    .pipe(assets)
    .pipe($.print())
    .pipe($.if('*.js', $.uglify()))
    .pipe($.if('*.css', cssChannel()))
    .pipe(assets.restore())
    .pipe($.useref())
    .pipe($.if('*.html', $.minifyHtml({conditionals: true, loose: true})))
    .pipe(gulp.dest('dist'));
});

gulp.task('images', function () {
  return gulp.src('app/images/**/*')
    .pipe($.cache($.imagemin({
      progressive: true,
      interlaced: true
    })))
    .pipe(gulp.dest('dist/images'));
});

gulp.task('fonts', function () {
  return gulp.src(require('main-bower-files')().concat('app/fonts/**/*'))
    .pipe($.filter('**/*.{eot,svg,ttf,woff}'))
    .pipe($.flatten())
    .pipe(gulp.dest('dist/fonts'));
});

gulp.task('extras', function () {
  return gulp.src([
    'app/*.*',
    '!app/*.html',
    '!app/*.jade',
    'node_modules/apache-server-configs/dist/.htaccess'
  ], {
    dot: true
  }).pipe(gulp.dest('dist'));
});

gulp.task('clean', require('del').bind(null, ['.tmp', 'dist']));

gulp.task('connect', ['templates', 'styles'], function () {
  var serveStatic = require('serve-static');
  var serveIndex = require('serve-index');
  var app = require('connect')()
    .use(require('connect-livereload')({port: 35729}))
    .use(serveStatic('.tmp'))
    .use(serveStatic('app'))
    // paths to bower_components should be relative to the current file
    // e.g. in app/index.html you should use ../bower_components
    .use('/bower_components', serveStatic('bower_components'))
    .use(serveIndex('app'));

  require('http').createServer(app)
    .listen(9000)
    .on('listening', function () {
      console.log('Started connect web server on http://localhost:9000');
    });
});

gulp.task('serve', ['connect', 'watch'], function () {
  require('opn')('http://localhost:9000');
});

// inject bower components
gulp.task('wiredep', function () {
  var wiredep = require('wiredep').stream;

  gulp.src('app/styles/*.scss')
    .pipe(wiredep())
    .pipe(gulp.dest('app/styles'));

  gulp.src('app/*.html')
    .pipe(wiredep({exclude: ['bootstrap-sass-official']}))
    .pipe(gulp.dest('app'));
});

gulp.task('watch', ['connect'], function () {
  $.livereload.listen();

  // watch for changes
  gulp.watch([
    'app/*.jade',
    '.tmp/styles/**/*.css',
    'app/scripts/**/*.js',
    'app/images/**/*'
  ]).on('change', $.livereload.changed);

  gulp.watch('app/demo.jade', ['templates_demo']);
  gulp.watch('app/index.jade', ['templates']);
  gulp.watch('app/styles/**/*.scss', ['styles_theme']);
  gulp.watch('app/styles/demo.scss', ['styles']);
  gulp.watch('bower.json', ['wiredep']);
});

gulp.task('build', ['jshint', 'html', 'images', 'fonts', 'extras'], function () {
  return gulp.src('dist/**/*').pipe($.size({title: 'build', gzip: true}));
});

gulp.task('default', ['clean'], function () {
  gulp.start('build');
});

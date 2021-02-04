const gulp = require(`gulp`);
const plumber = require(`gulp-plumber`);
const sourcemap = require(`gulp-sourcemaps`);
const nunjucks = require(`gulp-nunjucks-html`);
const sass = require(`gulp-sass`);
const postcss = require(`gulp-postcss`);
const autoprefixer = require(`autoprefixer`);
const csso = require(`postcss-csso`);
const rename = require(`gulp-rename`);
const htmlmin = require(`gulp-htmlmin`);
const uglify = require(`gulp-uglify`);
const imagemin = require(`gulp-imagemin`);
const webp = require(`gulp-webp`);
const svgstore = require(`gulp-svgstore`);
const del = require(`del`);
const sync = require(`browser-sync`).create();


// HTML
const html = () => {
  return gulp.src(`source/*.html`)
    .pipe(plumber())
    .pipe(nunjucks({ searchPaths: [`source`] }))
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(gulp.dest(`build`))
    .pipe(sync.stream());
};

exports.html = html;


// Styles
const styles = () => {
  return gulp.src(`source/sass/style.scss`)
    .pipe(plumber())
    .pipe(sourcemap.init())
    .pipe(sass())
    .pipe(postcss([
      autoprefixer(),
      csso()
    ]))
    .pipe(rename(`style.min.css`))
    .pipe(sourcemap.write(`.`))
    .pipe(gulp.dest(`build/css`))
    .pipe(sync.stream());
};

exports.styles = styles;


// Scripts
const scripts = () => {
  return gulp.src(`source/js/*.js`)
    .pipe(uglify())
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulp.dest(`build/js`))
    .pipe(sync.stream());
};

exports.scripts = scripts;


// Images
const images = () => {
  return gulp.src(`source/img/**/*.{png,jpg,svg}`)
    .pipe(imagemin([
      imagemin.optipng({ optimizationLevel: 3 }),
      imagemin.mozjpeg({ progressive: true }),
      imagemin.svgo()
    ]));
};

exports.images = images;


// WebP
const createWebp = () => {
  return gulp.src(`source/img/**/*.{jpg,png}`)
    .pipe(webp({ quality: 70 }))
    .pipe(gulp.dest(`source/img/webp`));
}

exports.createWebp = createWebp;


// Sprite
const sprite = () => {
  return gulp.src(`source/img/icons/*.svg`)
    .pipe(svgstore())
    .pipe(rename(`sprite.svg`))
    .pipe(gulp.dest(`source`));
};

exports.sprite = sprite;


// Copy
const copy = () => {
  return gulp.src([
    `source/fonts/*.{woff2,woff}`,
    `source/*.ico`,
    `source/img/**/*.{jpg,png,svg,webp}`,
    // `source/templates/includes/sprite.svg`
  ], {
    base: `source`
  })
    .pipe(gulp.dest(`build`));
};

exports.copy = copy;


// Clean
const clean = () => {
  return del(`build`);
};


// Server
const server = (done) => {
  sync.init({
    server: {
      baseDir: `build`
    },
    cors: true,
    notify: false,
    ui: false,
  });
  done();
};

exports.server = server;


// Watcher
const watcher = () => {
  gulp.watch(`source/sass/**/*.scss`, gulp.series(styles));
  gulp.watch(`source/js/script.js`, gulp.series(scripts));
  gulp.watch(`source/**/*.html`, gulp.series(html));
};


// Optimization
const optimization = gulp.series(
  createWebp,
  images
);

exports.optimization = optimization;


// Build
const build = gulp.series(
  clean,
  gulp.parallel(
    html,
    styles,
    scripts,
    copy
  ));

exports.build = build;


// Default
exports.default = gulp.series(
  clean,
  gulp.parallel(
    html,
    styles,
    scripts,
    copy
  ),
  gulp.series(
    server,
    watcher
  ));

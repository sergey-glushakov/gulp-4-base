"use strict";

const gulp = require("gulp");

const sass = require("gulp-sass");
const sassGlob = require("gulp-sass-glob");
const groupMediaQueries = require("gulp-group-css-media-queries");
const cleanCSS = require("gulp-cleancss");
const postcss = require("gulp-postcss");
const autoprefixer = require("autoprefixer");

const concat = require("gulp-concat");
const uglify = require("gulp-uglify");
const babel = require("gulp-babel");

const pug = require("gulp-pug"); //pug добавлено

const rename = require("gulp-rename");
const sourcemaps = require("gulp-sourcemaps");
const replace = require("gulp-replace");
const del = require("del");
const plumber = require("gulp-plumber");
const browserSync = require("browser-sync").create();

const svgstore = require("gulp-svgstore");
const cheerio = require("gulp-cheerio"); // добавить???
const svgmin = require("gulp-svgmin");
const imagemin = require("gulp-imagemin");
const newer = require("gulp-newer");

const paths = {
    src: "./src/", // paths.src
    build: "./build/", // paths.build
    templates: {
        pages: "./src/pug/pages/*.pug",
        src: "./src/pug/**/*.pug",
        build: "./build/"
    }
};

const vendorCSS = [
    "node_modules/normalize.css/normalize.css",
    "node_modules/font-awesome/css/font-awesome.css",
    "node_modules/swiper/css/swiper.min.css",
    "node_modules/slick-slider/slick/slick.css",
    "node_modules/slick-slider/slick/slick-theme.css"
];

const vendorJS = [
    "node_modules/jquery/dist/jquery.js",
    "node_modules/jquery.maskedinput/src/jquery.maskedinput.js",
    "node_modules/jquery-validation/dist/jquery.validate.js",
    "node_modules/jquery-validation/dist/additional-methods.js",
    "node_modules/swiper/js/swiper.min.js",
    "node_modules/slick-slider/slick/slick.js"
];

function fonts() {
    return gulp
        .src(paths.src + "fonts/**/*.*")
        .pipe(gulp.dest(paths.build + "fonts/"));
}

function styles() {
    return (
        gulp
            .src(paths.src + "scss/main.scss")
            .pipe(plumber())
            .pipe(sourcemaps.init())
            //.pipe(sassGlob())
            .pipe(sass()) // { outputStyle: 'compressed' }
            //.pipe(groupMediaQueries())
            .pipe(postcss([autoprefixer({ browsers: ["last 2 version"] })]))
            //.pipe(cleanCSS())
            //.pipe(rename({ suffix: ".min" }))
            .pipe(sourcemaps.write("./"))
            .pipe(gulp.dest(paths.build + "css/"))
    );
}

function stylesVendor() {
    return gulp
        .src(vendorCSS)
        .pipe(concat("vendors.min.css"))
        .pipe(gulp.dest(paths.build + "css/"));
}

function scripts() {
    return gulp
        .src(paths.src + "js/*.js")
        .pipe(plumber())
        .pipe(
            babel({
                presets: ["env"]
            })
        )
        .pipe(uglify())
        .pipe(concat("script.min.js"))
        .pipe(gulp.dest(paths.build + "js/"));
}

function scriptsVendor() {
    return gulp
        .src(vendorJS)
        .pipe(uglify())
        .pipe(concat("vendors.min.js"))
        .pipe(gulp.dest(paths.build + "js/"));
}

function preppug() {
    return gulp
        .src(paths.templates.pages)
        .pipe(plumber())
        .pipe(
            pug({
                pretty: true
            })
        )
        .pipe(replace(/\n\s*<!--DEV[\s\S]+?-->/gm, ""))
        .pipe(gulp.dest(paths.build));
}

function images() {
    return (
        gulp
            .src(paths.src + "img/**/*.{jpg,jpeg,png,gif,svg}")
            .pipe(newer(paths.build + "img/"))
            //.pipe(imagemin()) // если картинок будет много, то и времени будет уходить много
            .pipe(gulp.dest(paths.build + "img/"))
    );
}

function svg() {
    return (
        gulp
            .src(paths.src + "svg/**/*.svg")
            .pipe(
                svgmin(function(file) {
                    return {
                        plugins: [
                            {
                                cleanupIDs: {
                                    minify: true
                                }
                            }
                        ]
                    };
                })
            )

            //удалить все атрибуты fill, style and stroke в фигурах
            .pipe(
                cheerio({
                    run: function($) {
                        $("[fill]").removeAttr("fill");
                        $("[stroke]").removeAttr("stroke");
                        $("[style]").removeAttr("style");
                    },
                    parserOptions: {
                        xmlMode: true
                    }
                })
            )
            .pipe(replace("&gt;", ">")) //Добавить????
            .pipe(svgstore({ inlineSvg: true }))
            .pipe(rename("sprite.svg"))
            .pipe(gulp.dest(paths.build + "img/"))
    );
}

function clean() {
    return del("build/");
}

function watch() {
    gulp.watch(paths.src + "scss/**/*.scss", styles);
    gulp.watch(paths.src + "js/**/*.js", scripts);
    gulp.watch(paths.templates.src, preppug);
}

function serve() {
    browserSync.init({
        server: {
            baseDir: paths.build
        }
    });
    browserSync.watch(paths.build + "**/*.*", browserSync.reload);
}

exports.fonts = fonts;
exports.stylesVendor = stylesVendor;
exports.styles = styles;
exports.scripts = scripts;
exports.scriptsVendor = scriptsVendor;
exports.preppug = preppug;
exports.images = images;
exports.svg = svg;
exports.clean = clean;
exports.watch = watch;

gulp.task(
    "build",
    gulp.series(
        clean,
        fonts,
        images,
        gulp.parallel(stylesVendor, styles, scriptsVendor, scripts, preppug)
    )
);

gulp.task(
    "default",
    gulp.series(
        clean,
        fonts,
        images,
        svg,
        gulp.parallel(stylesVendor, styles, scriptsVendor, scripts, preppug),
        gulp.parallel(watch, serve)
    )
);

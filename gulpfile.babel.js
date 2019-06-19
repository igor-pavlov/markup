// import packages

import path from 'path';
import gulp from 'gulp';
import pug from 'gulp-pug';
import browserify from 'browserify';
import babelify from 'babelify';
import source from 'vinyl-source-stream';
import buffer from 'vinyl-buffer';
import util from 'gulp-util';
import sass from 'gulp-sass';
import autoprefixer from 'gulp-autoprefixer';
import sourceMaps from 'gulp-sourcemaps';
import browserSync from 'browser-sync';
import svgSprite from 'gulp-svg-sprite';
import svgStore from 'gulp-svgstore';
import svgSymbols from 'gulp-svg-symbols';
import svgmin from 'gulp-svgmin';
import cheerio from 'gulp-cheerio';
import inject from 'gulp-inject';
import _if from 'gulp-if';
import uglify from 'gulp-uglify';
import rename from 'gulp-rename';
import del from 'del';
import imagemin from 'gulp-imagemin';
import optipng from 'imagemin-optipng';
import pngquant from 'imagemin-pngquant';
import jpegoptim from 'imagemin-jpegoptim';
import plumber from 'gulp-plumber';
import notify from 'gulp-notify';
import replace from 'gulp-replace';
import getData from 'jade-get-data';

import config from './config';

const data = {
    getData: getData('src/data'),
    jv0: 'javascript:void(0);'
};

const PATHS = {
    sass: {
        src: config.sourceDir + '/styles',
        src2: config.sourceDir + '/blocks/**',
        src3: config.sourceDir + '/styles/**',
        dest: config.buildDir + '/assets/styles',
        mask: '/*.+(sass|scss)'
    },
    js: {
        src: config.sourceDir + '/scripts',
        dest: config.buildDir + '/assets/scripts',
        mask: '/*.js'
    },
    img: {
        src: config.sourceDir + '/images',
        dest: config.buildDir + '/assets/images',
        mask: '/**/*.*'
    },
    html: {
        src: config.sourceDir + '/pages',
        dest: config.buildDir,
        mask: '/**/[^_]*.+(html|php)'
    },
    fonts: {
        src: config.sourceDir + '/fonts',
        dest: config.buildDir + '/assets/fonts',
        mask: '/**/*.*'
    },
    watch: {
        sass: config.sourceDir + '/**/*.+(sass|scss)',
        js: config.sourceDir + '/scripts/**/*.js',
        img: config.sourceDir + '/images/**/*.+(png|jpg|jpeg|gif|svg)',
        html: config.sourceDir + '/**/*.+(html|pug)',
        fonts: config.sourceDir + '/fonts/**/*'
    }
};

const handleError = (err) => {
    notify({
        title: 'Gulp Task Error',
        message: '!!!ERROR!!! Check the console.'
    }).write(err);
    console.log(err.toString());
    this.emit('end');
};

const handleWatchEvent = (event, filePath, description) => {
    if (event.type === 'deleted') {
        const filePathFromSrc = path.relative(path.resolve(filePath.src), event.path),
            destFilePath = path.resolve(filePath.dest, filePathFromSrc);
        console.log(destFilePath);
        del.sync(destFilePath);
    }
    if (config.notifications) {
        notify({
            title: 'Gulp Task Complete',
            message: description + ' has been compiled'
        }).write('');
    }
};

gulp.task('app:templates', () => {
     gulp.src(PATHS.html.src + '/*.pug')
        .pipe(plumber({errorHandle: handleError}))
        .pipe(pug({
            basedir: 'src', data,
            pretty: true
        }))
        .pipe(gulp.dest(PATHS.html.dest))
        .pipe(browserSync.stream({once: true}))
});

gulp.task('app:sass', () => {
    return gulp.src(PATHS.sass.src + PATHS.sass.mask)
        .pipe(plumber({errorHandle: handleError}))
        .pipe(_if(!config.production, sourceMaps.init()))
        .pipe(sass({outputStyle: 'compressed'}).on('error', handleError))
        .pipe(autoprefixer('last 2 versions', {cascade: true}))
        .pipe(rename({suffix: '.min'}))
        .pipe(_if(!config.production, sourceMaps.write('.')))
        .pipe(gulp.dest(PATHS.sass.dest))
        .pipe(browserSync.stream({once: true}))
});

gulp.task('app:js', () => {
    const b = browserify({
        entries: PATHS.js.src + '/app.js',
        debug: true,
        transform: [babelify.configure({
            presets: ['env']
        })]
    });

    return b.bundle()
        .pipe(source('app.js'))
        .pipe(buffer())
        .pipe(plumber({errorHandle: handleError}))
        .pipe(_if(!config.production, sourceMaps.init()))
        .on('error', util.log)
        // .pipe(uglify())
        .pipe(rename({suffix: '.min'}))
        .pipe(_if(!config.production, sourceMaps.write('.')))
        .pipe(gulp.dest(PATHS.js.dest))
        .pipe(browserSync.stream({once: true}));
});

gulp.task('svgStore', () => {
    const svgs = gulp
        .src(PATHS.img.src + '/**/*.svg')
        .pipe(svgStore({
            inlineSvg: true
        }));

    function fileContents (filePath, file) {
        return file.contents.toString();
    }

    return gulp
        .src(PATHS.img.src + 'icon.svg')
        .pipe(inject(svgs, { transform: fileContents }))
        .pipe(gulp.dest(PATHS.html.src + '/includes/'));
});

gulp.task('icons', () => {
    return gulp.src(PATHS.img.src + '/**/*.svg')
        .pipe(svgmin({
            js2svg: {
                pretty: true
            }
        }))
        .pipe(cheerio({
            run: function ($) {
                // $('[fill]').removeAttr('fill');
                // $('[stroke]').removeAttr('stroke');
                // $('[style]').removeAttr('style');
            },
            parserOptions: {xmlMode: true}
        }))
        .pipe(replace('&gt;', '>'))

        .pipe(svgSprite({
            mode: {
                symbol: {
                    sprite: "../../../build/assets/images/icon.svg",
                    render: {
                        scss: {
                            dest: ''
                        }
                    }
                }
            }
        }))
        .pipe(gulp.dest(PATHS.sass.src));
});

gulp.task('app:images', () => {
    return gulp.src(PATHS.img.src + PATHS.img.mask)
        .pipe(plumber({errorHandle: handleError}))
        .pipe(imagemin([
            imagemin.gifsicle({interlaced: true}),
            jpegoptim(config.jpeg),
            _if(config.png.lossless, optipng(config.png.optipng), pngquant(config.png.pngquant)),
            imagemin.svgo({
                plugins: [
                    {removeViewBox: false},
                    {cleanupIDs: false}
                ]
            })
        ], {
            verbose: true
        }))
        .pipe(gulp.dest(PATHS.img.dest))
        .pipe(browserSync.stream({once: true}))
});

gulp.task('app:fonts', () => {
    return gulp.src(PATHS.fonts.src + PATHS.fonts.mask)
        .pipe(gulp.dest(PATHS.fonts.dest));
});

gulp.task('clean', () => {
    if (config.useTemplates) {
        return del.sync([config.buildDir + '/**/*', '!' + config.buildDir + '/.gitkeep'], {dot: true});
    } else {
        return del.sync([
            PATHS.js.dest,
            PATHS.sass.dest,
            PATHS.img.dest,
            PATHS.fonts.dest
        ]);
    }
});

gulp.task('watch', ['build'], () => {
    gulp.watch(PATHS.watch.sass, ['app:sass']).on('change', (event) => handleWatchEvent(event, PATHS.sass, 'SASS'));
    gulp.watch(PATHS.watch.js, ['app:js']).on('change', (event) => handleWatchEvent(event, PATHS.js, 'JS'));
    gulp.watch(PATHS.watch.img, ['app:images', 'svgStore']).on('change', (event) => handleWatchEvent(event, PATHS.img, 'IMG'));
    gulp.watch(PATHS.watch.fonts, ['app:fonts']).on('change', (event) => handleWatchEvent(event, PATHS.fonts, 'FONTS'));
    gulp.watch(PATHS.watch.html, ['app:templates']).on('change', (event) => handleWatchEvent(event, PATHS.html, 'HTML'));
});

gulp.task('live', ['watch'], () => {
    browserSync.init({
        server: {
            baseDir: config.buildDir
        },
        tunnel: false,
        notify: config.notifications,
        open: config.openBrowser
    });
});

gulp.task('build', [
    'clean',
    'icons',
    'app:js',
    'app:images',
    'app:templates',
    'app:fonts',
    'app:sass'
]);

gulp.task('production', () => {
    config.production = true;
    gulp.run(['app:sass', 'app:js']);
});

gulp.task('default', ['build']);

module.exports = {
    useTemplates: true,
    production: false,
    openBrowser: true,
    notifications: true,
    phpProxyHost: '127.0.0.1',
    phpProxyPort: 8888,
    sourceDir: 'src',
    buildDir: 'build',
    jpeg: {
        progressive: true,
        max: 90
    },
    png: {
        lossless: true,
        // lossless
        optipng: {
            optimizationLevel: 3,
            strip: 'all'
        },
        // lossy
        pngquant: {
            quality: 80,
            speed: 1
        }
    }
};
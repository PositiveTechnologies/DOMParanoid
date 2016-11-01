module.exports = function(config) {
    config.set({
        autoWatch: true,
        basePath: '../',
        frameworks: ['qunit'],
        files: [
            'node_modules/qunit-parameterize/qunit-parameterize.js',
            'test/**/*.spec.js'
        ],

        preprocessors: {
            'src/**/*.js': ['webpack'],
            'test/**/*.js': ['webpack']
        },

        reporters: ['progress'],

        exclude: [],
        port: 9876,

        webpack: {
            plugins: [],
            devtool: 'inline-source-map',
            resolve: {
                alias: {},
                modulesDirectories: [
                    'test',
                    'src',
                    'dist'
                ],
                extensions: ['', '.js', '.json']
            },
            module: {
                loaders: [{
                    test: /\.json$/,
                    loader: 'json-loader'
                }]
            }
        },

        webpackMiddleware: {
            noInfo: true
        },
        browserDisconnectTimeout: 10000,
        browserDisconnectTolerance: 1,
        browserNoActivityTimeout: 240000,
        captureTimeout: 240000,

        plugins: [
            'karma-webpack',
            'karma-chrome-launcher',
            'karma-firefox-launcher',
            'karma-qunit'
        ],

        singleRun: true,
        colors: true,
        logLevel: config.LOG_INFO
    });
};
